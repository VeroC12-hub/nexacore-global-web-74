import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'operations_manager' | 'project_manager' | 'staff' | 'member' | 'client';

export interface RolePermissions {
  canAccessPaymentConfig: boolean;
  canViewAllProjects: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageWorkflows: boolean;
  canAccessSystemSettings: boolean;
  canViewFinancials: boolean;
  canManageInvoices: boolean;
  role: UserRole | null;
}

const getRolePermissions = (role: UserRole | null): RolePermissions => {
  const basePermissions: RolePermissions = {
    canAccessPaymentConfig: false,
    canViewAllProjects: false,
    canManageUsers: false,
    canViewReports: false,
    canManageWorkflows: false,
    canAccessSystemSettings: false,
    canViewFinancials: false,
    canManageInvoices: false,
    role
  };

  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
        canAccessPaymentConfig: true, // ONLY ADMIN
        canViewAllProjects: true,
        canManageUsers: true,
        canViewReports: true,
        canManageWorkflows: true,
        canAccessSystemSettings: true,
        canViewFinancials: true,
        canManageInvoices: true,
      };

    case 'operations_manager':
      return {
        ...basePermissions,
        canAccessPaymentConfig: false, // BLOCKED
        canViewAllProjects: true,
        canManageUsers: false,
        canViewReports: true,
        canManageWorkflows: true,
        canAccessSystemSettings: false,
        canViewFinancials: true,
        canManageInvoices: true,
      };

    case 'project_manager':
      return {
        ...basePermissions,
        canAccessPaymentConfig: false, // BLOCKED
        canViewAllProjects: true,
        canManageUsers: false,
        canViewReports: true,
        canManageWorkflows: false,
        canAccessSystemSettings: false,
        canViewFinancials: false,
        canManageInvoices: false,
      };

    case 'staff':
      return {
        ...basePermissions,
        canAccessPaymentConfig: false, // BLOCKED
        canViewAllProjects: false,
        canManageUsers: false,
        canViewReports: false,
        canManageWorkflows: false,
        canAccessSystemSettings: false,
        canViewFinancials: false,
        canManageInvoices: false,
      };

    default:
      return basePermissions;
  }
};

export const useRolePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<RolePermissions>(getRolePermissions(null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setPermissions(getRolePermissions(null));
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setPermissions(getRolePermissions(null));
        } else {
          const userRole = profile.role as UserRole;
          setPermissions(getRolePermissions(userRole));
        }
      } catch (error) {
        console.error('Error in useRolePermissions:', error);
        setPermissions(getRolePermissions(null));
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { permissions, loading };
};

// Helper functions for specific checks
export const useIsAdmin = () => {
  const { permissions } = useRolePermissions();
  return permissions.role === 'admin';
};

export const useCanAccessPaymentConfig = () => {
  const { permissions } = useRolePermissions();
  return permissions.canAccessPaymentConfig;
};

export const useCanManageUsers = () => {
  const { permissions } = useRolePermissions();
  return permissions.canManageUsers;
};