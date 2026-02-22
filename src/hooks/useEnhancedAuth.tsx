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
// After running the fix migration (20260222100000_fix_auth_rls_and_roles.sql),
// profiles.role is kept in sync with erp_staff_roles, so one query is enough.
// Falls back to erp_staff_roles if the profile role isn't an ERP role.
async function fetchProfile(authUser: User): Promise<EnhancedUser> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
    );

    const profileResult = await Promise.race([
      supabase.from('profiles').select('*').eq('id', authUser.id).single(),
      timeout,
    ]);

    const profileData = profileResult.data;
    const profileRole = profileData?.role as string | undefined;

    // If profile has a valid ERP role, use it directly (fast path)
    if (profileRole && ERP_ROLES.includes(profileRole)) {
      return buildUser(authUser, profileRole as UserRole, profileData);
    }

    // Fallback: check erp_staff_roles (covers case where profile.role isn't synced yet)
    try {
      const staffResult = await Promise.race([
        supabase.from('erp_staff_roles')
          .select('role, department, position, hourly_rate')
          .eq('user_id', authUser.id)
          .eq('is_active', true)
          .maybeSingle(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Staff role timeout')), 4000)),
      ]);

      const staffData = staffResult.data;
      if (staffData?.role && ERP_ROLES.includes(staffData.role)) {
        return buildUser(authUser, staffData.role as UserRole, {
          ...profileData,
          department: staffData.department,
          position: staffData.position,
          hourly_rate: staffData.hourly_rate,
        });
      }
    } catch {
      // erp_staff_roles unavailable — use profile as-is
    }

    return buildUser(authUser, 'client', profileData ?? undefined);
  } catch {
    return buildUser(authUser, 'client');
  }
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
        const enhanced = await fetchProfile(session.user);
        if (mountedRef.current) setUser(enhanced);
      } else {
        if (mountedRef.current) setUser(null);
      }
    } catch {
      if (mountedRef.current) setUser(null);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    let subscription: any = null;

    // Hard safety: loading MUST become false within 12 seconds no matter what.
    // Raised from 5s to accommodate the 8s fetchProfile timeout + network overhead.
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) setLoading(false);
    }, 12000);

    // ONLY source of getSession — no other provider calls this
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!mountedRef.current) return;
        if (session?.user) {
          const enhanced = await fetchProfile(session.user);
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
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED' && session?.user) {
          const enhanced = await fetchProfile(session.user);
          if (mountedRef.current) setUser(enhanced);
          return;
        }

        // Handle SIGNED_IN only if not already handled by signIn function
        if (event === 'SIGNED_IN' && session?.user) {
          const enhanced = await fetchProfile(session.user);
          if (mountedRef.current) {
            setUser(enhanced);
            setLoading(false);
          }
        }
      });

      subscription = data?.subscription;
    } catch { }

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      try { subscription?.unsubscribe(); } catch { }
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
        const enhanced = await fetchProfile(data.user);
        if (mountedRef.current) {
          setUser(enhanced);
          setLoading(false);
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
