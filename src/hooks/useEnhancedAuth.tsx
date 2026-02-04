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

export function EnhancedAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchEnhancedUserData = async (authUser: User): Promise<EnhancedUser> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return buildDefaultUser(authUser, 'admin');
      }

      const userRole = (profileData?.role || 'admin') as UserRole;

      return {
        id: authUser.id,
        email: authUser.email!,
        tenant_id: 'default',
        role: userRole,
        permissions: ROLE_PERMISSIONS[userRole] || [],
        department: (profileData as any)?.department || null,
        position: (profileData as any)?.position || null,
        hourly_rate: null,
        profile: {
          full_name: profileData?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar_url: profileData?.avatar_url || null,
          phone: profileData?.phone || null,
          bio: profileData?.bio || null
        }
      };
    } catch (error) {
      console.error('Error fetching enhanced user data:', error);
      return buildDefaultUser(authUser, 'admin');
    }
  };

  function buildDefaultUser(authUser: User, role: UserRole): EnhancedUser {
    return {
      id: authUser.id,
      email: authUser.email!,
      tenant_id: 'default',
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
      department: null,
      position: null,
      hourly_rate: null,
      profile: {
        full_name: authUser.email?.split('@')[0] || 'User',
        avatar_url: null,
        phone: null,
        bio: null
      }
    };
  }

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const enhancedUser = await fetchEnhancedUserData(session.user);
        if (mountedRef.current) setUser(enhancedUser);
      } else {
        if (mountedRef.current) setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      if (mountedRef.current) setUser(null);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    let subscription: any = null;

    // Safety: loading MUST become false within 6 seconds
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('Auth: safety timeout - forcing loading to false');
        setLoading(false);
      }
    }, 6000);

    // 1. Get current session (fast — reads from localStorage first)
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (!mountedRef.current) return;
        if (error) {
          console.error('getSession error:', error);
          setUser(null);
          setLoading(false);
          return;
        }
        if (session?.user) {
          const enhanced = await fetchEnhancedUserData(session.user);
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

    // 2. Listen for future auth changes (sign in, sign out, token refresh)
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mountedRef.current) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const enhanced = await fetchEnhancedUserData(session.user);
          if (mountedRef.current) {
            setUser(enhanced);
            setLoading(false);
          }
        }
      });

      subscription = data?.subscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      try { subscription?.unsubscribe(); } catch {}
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        const enhancedUser = await fetchEnhancedUserData(data.user);
        setUser(enhancedUser);
      }

      setLoading(false);
      return {};
    } catch (error: any) {
      setLoading(false);
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
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

// Route protection component
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
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Insufficient Permissions</h2>
            <p className="text-muted-foreground mb-4">
              You don't have the required role to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  if (requiredPermissions.length > 0 && !requiredPermissions.every(p => hasPermission(p))) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Insufficient Permissions</h2>
            <p className="text-muted-foreground mb-4">
              You don't have the required permissions to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

export function useTenant() {
  const { user } = useEnhancedAuth();

  return {
    tenantId: user?.tenant_id || null,
    setTenantContext: async () => {}
  };
}
