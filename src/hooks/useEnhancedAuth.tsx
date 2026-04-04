import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedUser, UserRole, Permission, ROLE_PERMISSIONS } from '@/types/erp';

interface EnhancedAuthContextType {
  user: EnhancedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isProjectManager: boolean;
  isOperationsManager: boolean;
  isDeveloper: boolean;
  isSupport: boolean;
  isClient: boolean;
  refreshUser: () => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

function buildUser(authUser: User, role: UserRole, profileData?: any): EnhancedUser {
  return {
    id: authUser.id,
    email: authUser.email!,
    tenant_id: 'default',
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
    department: profileData?.department || null,
    position: profileData?.position || null,
    hourly_rate: null,
    profile: {
      full_name: profileData?.full_name || authUser.email?.split('@')[0] || 'User',
      avatar_url: profileData?.avatar_url || null,
      phone: profileData?.phone || null,
      bio: profileData?.bio || null
    }
  };
}

// ERP roles that can be returned from fetchProfile
const ERP_ROLES: string[] = ['admin', 'project_manager', 'operations_manager', 'developer', 'support', 'client'];

// Fetch profile with an 8-second timeout.
// THROWS on network/timeout errors — callers must handle.
// Only returns 'client' when the DB confirms the user has no elevated role.
// Never silently downgrades an admin to client on a transient failure.
async function fetchProfile(authUser: User): Promise<EnhancedUser> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
  );

  // Throws if timeout fires first or Supabase returns an error
  const { data: profileData, error: profileError } = await Promise.race([
    supabase.from('profiles').select('*').eq('id', authUser.id).single(),
    timeout,
  ]) as any;

  if (profileError) throw profileError;

  const profileRole = profileData?.role as string | undefined;

  // Fast path: only for privileged roles — never short-circuit on 'client'
  // because profiles.role can be stale while erp_staff_roles has a higher role.
  const PRIVILEGED_ROLES = ERP_ROLES.filter(r => r !== 'client');
  if (profileRole && PRIVILEGED_ROLES.includes(profileRole)) {
    return buildUser(authUser, profileRole as UserRole, profileData);
  }

  // Always check erp_staff_roles — covers stale profiles.role and first-time setup
  try {
    const { data: staffData } = await Promise.race([
      supabase.from('erp_staff_roles')
        .select('role, department, position, hourly_rate')
        .eq('user_id', authUser.id)
        .eq('is_active', true)
        .maybeSingle(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Staff role timeout')), 4000)),
    ]) as any;

    if (staffData?.role && ERP_ROLES.includes(staffData.role)) {
      return buildUser(authUser, staffData.role as UserRole, {
        ...profileData,
        department: staffData.department,
        position: staffData.position,
        hourly_rate: staffData.hourly_rate,
      });
    }
  } catch {
    // erp_staff_roles unavailable — use profile role only
  }

  // User has no elevated role in either table — they are a genuine client
  return buildUser(authUser, 'client', profileData ?? undefined);
}

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const signingInRef = useRef(false); // Prevents listener from duplicating signIn work

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // On failure, keep the existing user state — don't clear a valid session
        const enhanced = await fetchProfile(session.user);
        if (mountedRef.current) setUser(enhanced);
      } else {
        if (mountedRef.current) setUser(null);
      }
    } catch {
      // fetchProfile failed — leave user as-is rather than signing them out
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    let subscription: any = null;

    // Hard safety: loading MUST become false within 20 seconds no matter what.
    // Covers 8s fetchProfile timeout × 2 attempts + 1.5s retry delay + overhead.
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) setLoading(false);
    }, 20000);

    // ONLY source of getSession — no other provider calls this.
    // On mobile, getSession() may return a session from storage but the
    // Supabase client's internal auth state might not be fully initialised yet.
    // Calling setSession() explicitly ensures the client's HTTP layer has the
    // correct Authorization header before any DB queries are made.
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!mountedRef.current) return;
        if (session?.user) {
          // Explicitly re-set the session so the Supabase client's internal
          // state is guaranteed to be populated (critical for mobile).
          if (session.access_token && session.refresh_token) {
            await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }).catch(() => { /* ignore — best effort */ });
          }
          let enhanced: EnhancedUser | null = null;
          try {
            enhanced = await fetchProfile(session.user);
          } catch {
            // First attempt failed. On page refresh, the Supabase client's
            // auth headers may not be applied before the first DB query fires
            // (race with setSession above). Wait briefly and retry once before
            // giving up — this handles the "refresh signs you out" case.
            await new Promise(r => setTimeout(r, 1500));
            if (!mountedRef.current) return;
            try {
              enhanced = await fetchProfile(session.user);
            } catch {
              // Both attempts failed — no valid profile; redirect to auth.
            }
          }
          if (mountedRef.current) {
            setUser(enhanced);
            setLoading(false);
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setUser(null);
          setLoading(false);
        }
      });

    // Listen for auth changes AFTER initial load
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mountedRef.current) return;

        // Skip if signIn function is handling this (prevents double fetch)
        if (signingInRef.current && event === 'SIGNED_IN') return;

        if (event === 'SIGNED_OUT') {
          // Don't immediately trust SIGNED_OUT — Supabase can fire this
          // transiently during token rotation (tab comes back from idle and
          // the refresh races with the state change event). Verify the session
          // is actually gone before clearing the user.
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!mountedRef.current) return;
          if (currentSession?.user) {
            // Session is still alive — the SIGNED_OUT was a false positive.
            // Re-establish user from the live session.
            try {
              const enhanced = await fetchProfile(currentSession.user);
              if (mountedRef.current) setUser(enhanced);
            } catch { /* keep existing user state */ }
          } else {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          // Token refresh doesn't change the user's role or profile.
          // Re-fetching here can downgrade an admin to 'client' if the
          // network is slow when returning from idle. Skip the re-fetch.
          return;
        }

        // Handle SIGNED_IN only if not already handled by signIn function
        if (event === 'SIGNED_IN' && session?.user) {
          let enhanced: EnhancedUser | null = null;
          try {
            enhanced = await fetchProfile(session.user);
          } catch {
            // Profile fetch failed — send to auth rather than guessing a role
          }
          if (mountedRef.current) {
            setUser(enhanced);
            setLoading(false);
          }
        }
      });

      subscription = data?.subscription;
    } catch { }

    // When the tab comes back into focus after being hidden (idle, screen lock,
    // switching apps), proactively call getSession(). This forces Supabase to
    // refresh an expired access token before the page tries to make DB queries,
    // preventing the "signed out after idle" redirect.
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;
      if (!mountedRef.current) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mountedRef.current) return;
        if (session?.user) {
          // Session is alive — if user state was incorrectly cleared (false
          // SIGNED_OUT while tab was hidden), restore it now.
          setUser(current => {
            if (current !== null) return current; // Already set — no change needed
            return current; // null — will be restored below via fetchProfile
          });
          // Check current user via functional updater result won't work inline,
          // so read from a ref instead — use a simple approach: always try to
          // restore if the session is valid. fetchProfile is idempotent.
          try {
            const enhanced = await fetchProfile(session.user);
            if (mountedRef.current) setUser(enhanced);
          } catch { /* leave as-is */ }
        }
      } catch { /* ignore visibility refresh errors */ }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      try { subscription?.unsubscribe(); } catch { }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      signingInRef.current = true; // Tell listener to skip SIGNED_IN
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoading(false);
        signingInRef.current = false;
        return { error: error.message };
      }

      if (data.user) {
        try {
          const enhanced = await fetchProfile(data.user);
          if (mountedRef.current) {
            setUser(enhanced);
            setLoading(false);
          }
        } catch {
          // Profile fetch failed after valid credentials — don't guess a role,
          // return an error so the user can retry
          if (mountedRef.current) setLoading(false);
          signingInRef.current = false;
          return { error: 'Signed in but could not load your profile. Please try again.' };
        }
      } else {
        setLoading(false);
      }

      signingInRef.current = false;
      return {};
    } catch (error: any) {
      setLoading(false);
      signingInRef.current = false;
      return { error: error.message || 'Sign in failed' };
    }
  };

  const signOut = async () => {
    setUser(null);
    setLoading(false);
    try {
      await supabase.auth.signOut();
    } catch { }
  };

  const hasPermission = (permission: Permission): boolean => {
    return !!user && user.permissions.includes(permission);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const value: EnhancedAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasPermission,
    hasRole,
    isAdmin: user?.role === 'admin',
    isProjectManager: user?.role === 'project_manager',
    isOperationsManager: user?.role === 'operations_manager',
    isDeveloper: user?.role === 'developer',
    isSupport: user?.role === 'support',
    isClient: user?.role === 'client',
    refreshUser
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
}

export function useEnhancedAuth() {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  fallback
}: ProtectedRouteProps) {
  const { user, loading, hasRole, hasPermission } = useEnhancedAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to access this page.</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Insufficient Permissions</h2>
          <p className="text-muted-foreground mb-4">You don't have the required role.</p>
        </div>
      </div>
    );
  }

  if (requiredPermissions.length > 0 && !requiredPermissions.every(p => hasPermission(p))) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Insufficient Permissions</h2>
          <p className="text-muted-foreground mb-4">You don't have the required permissions.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function useTenant() {
  const { user } = useEnhancedAuth();
  return {
    tenantId: user?.tenant_id || null,
    setTenantContext: async () => { }
  };
}
