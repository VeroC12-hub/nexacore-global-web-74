import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
        canAccessPaymentConfig: true, // ONLY ADMIN
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
        canAccessPaymentConfig: false, // BLOCKED
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
        canAccessPaymentConfig: false, // BLOCKED - Only admin
        canViewAllProjects: true,
        canManageProjects: true, // ✅ CAN MANAGE PROJECTS
        canManageQuotes: true, // ✅ CAN MANAGE QUOTES
        canManageUsers: false, // Can't change roles - Only admin
        canViewReports: true,
        canManageWorkflows: true, // ✅ CAN MANAGE WORKFLOWS
        canAccessSystemSettings: false, // BLOCKED - Only admin
        canViewFinancials: true, // ✅ CAN VIEW FINANCIALS
        canManageInvoices: true, // ✅ CAN MANAGE INVOICES
      };

    case 'staff':
      return {
        ...basePermissions,
        canAccessPaymentConfig: false, // BLOCKED
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
          // Default to admin role if profile doesn't exist (system owner)
          setPermissions(getRolePermissions('admin'));
        } else {
          const userRole = (profile?.role || 'admin') as UserRole;
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