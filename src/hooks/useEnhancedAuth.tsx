import React, { useState, useEffect, useContext, createContext } from 'react';
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

  const fetchEnhancedUserData = async (authUser: User): Promise<EnhancedUser | null> => {
    try {
      // Get user profile with role information from existing profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Create a basic user with default role if profile doesn't exist
        return {
          id: authUser.id,
          email: authUser.email!,
          tenant_id: 'default',
          role: 'admin' as UserRole, // Default to admin for users without profiles (system owner)
          permissions: ROLE_PERMISSIONS['admin'] || [],
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

      // Map roles to our enhanced user structure  
      const userRole = (profileData?.role || 'admin') as UserRole;
      
      return {
        id: authUser.id,
        email: authUser.email!,
        tenant_id: 'default', // Use default tenant for now
        role: userRole,
        permissions: ROLE_PERMISSIONS[userRole] || [],
        department: (profileData as any)?.department || null,
        position: (profileData as any)?.position || null,
        hourly_rate: null, // Not in current profiles table
        profile: {
          full_name: profileData?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar_url: profileData?.avatar_url || null,
          phone: profileData?.phone || null,
          bio: profileData?.bio || null
        }
      };
    } catch (error) {
      console.error('Error fetching enhanced user data:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      // First check if we have a session to avoid unnecessary API calls
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // If refresh token is invalid, clear it and sign out
        if (sessionError.message?.includes('Invalid Refresh Token') || 
            sessionError.message?.includes('Refresh Token Not Found')) {
          console.log('Clearing invalid refresh token...');
          await supabase.auth.signOut();
        }
        setUser(null);
        return;
      }

      if (session?.user) {
        const enhancedUser = await fetchEnhancedUserData(session.user);
        setUser(enhancedUser);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      // If refresh token is invalid, clear it and sign out
      if (error?.message?.includes('Invalid Refresh Token') || 
          error?.message?.includes('Refresh Token Not Found')) {
        console.log('Clearing invalid refresh token...');
        await supabase.auth.signOut();
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;

          try {
            if (session?.user) {
              // Handle all events that provide a session (SIGNED_IN, TOKEN_REFRESHED, INITIAL_SESSION)
              const enhancedUser = await fetchEnhancedUserData(session.user);
              if (isMounted) setUser(enhancedUser);
            } else if (event === 'SIGNED_OUT') {
              if (isMounted) setUser(null);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            if (isMounted) setUser(null);
          } finally {
            if (isMounted) setLoading(false);
          }
        });

        if (authListener?.data?.subscription) {
          subscription = authListener.data.subscription;
        }

        // THEN check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          console.error('Session error:', sessionError);
          if (sessionError.message?.includes('Invalid Refresh Token') ||
              sessionError.message?.includes('Refresh Token Not Found')) {
            await supabase.auth.signOut();
          }
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const enhancedUser = await fetchEnhancedUserData(session.user);
          if (isMounted) {
            setUser(enhancedUser);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      try {
        if (subscription?.unsubscribe) {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.warn('Error unsubscribing from auth listener:', error);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const enhancedUser = await fetchEnhancedUserData(data.user);
        setUser(enhancedUser);
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
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
            onClick={() => window.location.href = '/login'}
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
            <p className="text-sm text-muted-foreground">
              Required roles: {requiredRoles.join(', ')}
            </p>
          </div>
        </div>
      )
    );
  }

  if (requiredPermissions.length > 0 && !requiredPermissions.every(permission => hasPermission(permission))) {
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

// Hook for tenant-specific operations
export function useTenant() {
  const { user } = useEnhancedAuth();
  
  const setTenantContext = async () => {
    if (user?.tenant_id) {
      // Tenant context would be set via custom RPC if needed
      console.log('Tenant context:', user.tenant_id);
    }
  };

  useEffect(() => {
    setTenantContext();
  }, [user?.tenant_id]);

  return {
    tenantId: user?.tenant_id || null,
    setTenantContext
  };
}