import { useState, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

export type UserRole = 'admin' | 'operations_manager' | 'project_manager' | 'staff' | 'member' | 'client';

export interface RolePermissions {
  canAccessPaymentConfig: boolean;
  canViewAllProjects: boolean;
  canManageProjects: boolean;
  canManageQuotes: boolean;
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
    canManageProjects: false,
    canManageQuotes: false,
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
        canAccessPaymentConfig: true,
        canViewAllProjects: true,
        canManageProjects: true,
        canManageQuotes: true,
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
        canAccessPaymentConfig: false,
        canViewAllProjects: true,
        canManageProjects: true,
        canManageQuotes: true,
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
        canAccessPaymentConfig: false,
        canViewAllProjects: true,
        canManageProjects: true,
        canManageQuotes: true,
        canManageUsers: false,
        canViewReports: true,
        canManageWorkflows: true,
        canAccessSystemSettings: false,
        canViewFinancials: true,
        canManageInvoices: true,
      };

    case 'staff':
      return {
        ...basePermissions,
        canAccessPaymentConfig: false,
        canViewAllProjects: false,
        canManageProjects: false,
        canManageQuotes: false,
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
  const { user, loading: authLoading } = useEnhancedAuth();
  const [permissions, setPermissions] = useState<RolePermissions>(getRolePermissions(null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setPermissions(getRolePermissions(null));
      setLoading(false);
      return;
    }

    // Use the role already fetched by useEnhancedAuth — no extra DB query needed
    const userRole = (user.role || 'client') as UserRole;
    setPermissions(getRolePermissions(userRole));
    setLoading(false);
  }, [user, authLoading]);

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
