import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './useRolePermissions';

export interface DelegatedPermission {
  permission_type: string;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
}

export interface StaffPermissions {
  // View permissions
  canViewQuotes: boolean;
  canViewInvoices: boolean;
  canViewProjects: boolean;
  canViewUsers: boolean;
  canViewReports: boolean;
  canViewMessages: boolean;
  canViewFiles: boolean;
  canViewTeam: boolean;
  canViewPortfolio: boolean;
  canViewERP: boolean;

  // Manage permissions
  canManageQuotes: boolean;
  canManageInvoices: boolean;
  canManageProjects: boolean;
  canManageUsers: boolean;
  canManageWorkflows: boolean;
  canManageMessages: boolean;
  canManageFiles: boolean;
  canManagePortfolio: boolean;
  canManageERP: boolean;

  // Meta
  role: UserRole | null;
  isProjectManager: boolean;
  isAdmin: boolean;
  delegatedPermissions: DelegatedPermission[];
}

const getBaseRolePermissions = (role: UserRole | null): Partial<StaffPermissions> => {
  switch (role) {
    case 'admin':
      return {
        canViewQuotes: true,
        canViewInvoices: true,
        canViewProjects: true,
        canViewUsers: true,
        canViewReports: true,
        canViewMessages: true,
        canViewFiles: true,
        canViewTeam: true,
        canViewPortfolio: true,
        canViewERP: true,
        canManageQuotes: true,
        canManageInvoices: true,
        canManageProjects: true,
        canManageUsers: true,
        canManageWorkflows: true,
        canManageMessages: true,
        canManageFiles: true,
        canManagePortfolio: true,
        canManageERP: true,
        isAdmin: true,
        isProjectManager: true, // Admin has PM capabilities
      };

    case 'project_manager':
      return {
        canViewQuotes: true,
        canViewInvoices: true,
        canViewProjects: true,
        canViewUsers: true,
        canViewReports: true,
        canViewMessages: true,
        canViewFiles: true,
        canViewTeam: true,
        canViewPortfolio: true,
        canViewERP: true,
        canManageQuotes: true,
        canManageInvoices: true,
        canManageProjects: true,
        canManageUsers: false, // Can't change roles
        canManageWorkflows: true,
        canManageMessages: true,
        canManageFiles: true,
        canManagePortfolio: true,
        canManageERP: true,
        isAdmin: false,
        isProjectManager: true,
      };

    case 'operations_manager':
      return {
        canViewQuotes: true,
        canViewInvoices: true,
        canViewProjects: true,
        canViewUsers: true,
        canViewReports: true,
        canViewMessages: true,
        canViewFiles: true,
        canViewTeam: true,
        canViewPortfolio: true,
        canViewERP: true,
        canManageQuotes: true,
        canManageInvoices: true,
        canManageProjects: true,
        canManageUsers: false,
        canManageWorkflows: true,
        canManageMessages: true,
        canManageFiles: true,
        canManagePortfolio: true,
        canManageERP: false,
        isAdmin: false,
        isProjectManager: false,
      };

    case 'staff':
      // Staff have NO permissions by default
      // They must be granted permissions by project manager
      return {
        canViewQuotes: false,
        canViewInvoices: false,
        canViewProjects: false,
        canViewUsers: false,
        canViewReports: false,
        canViewMessages: false,
        canViewFiles: false,
        canViewTeam: false,
        canViewPortfolio: false,
        canViewERP: false,
        canManageQuotes: false,
        canManageInvoices: false,
        canManageProjects: false,
        canManageUsers: false,
        canManageWorkflows: false,
        canManageMessages: false,
        canManageFiles: false,
        canManagePortfolio: false,
        canManageERP: false,
        isAdmin: false,
        isProjectManager: false,
      };

    default:
      return {
        canViewQuotes: false,
        canViewInvoices: false,
        canViewProjects: false,
        canViewUsers: false,
        canViewReports: false,
        canViewMessages: false,
        canViewFiles: false,
        canViewTeam: false,
        canViewPortfolio: false,
        canViewERP: false,
        canManageQuotes: false,
        canManageInvoices: false,
        canManageProjects: false,
        canManageUsers: false,
        canManageWorkflows: false,
        canManageMessages: false,
        canManageFiles: false,
        canManagePortfolio: false,
        canManageERP: false,
        isAdmin: false,
        isProjectManager: false,
      };
  }
};

const applyDelegatedPermissions = (
  basePermissions: Partial<StaffPermissions>,
  delegatedPermissions: DelegatedPermission[]
): StaffPermissions => {
  const permissions = { ...basePermissions } as StaffPermissions;

  // Apply delegated permissions
  delegatedPermissions.forEach(({ permission_type }) => {
    switch (permission_type) {
      case 'quotes_manage':
        permissions.canViewQuotes = true;
        permissions.canManageQuotes = true;
        break;
      case 'invoices_manage':
        permissions.canViewInvoices = true;
        permissions.canManageInvoices = true;
        break;
      case 'projects_view':
        permissions.canViewProjects = true;
        break;
      case 'projects_manage':
        permissions.canViewProjects = true;
        permissions.canManageProjects = true;
        break;
      case 'users_view':
        permissions.canViewUsers = true;
        break;
      case 'users_manage':
        permissions.canViewUsers = true;
        permissions.canManageUsers = true;
        break;
      case 'reports_view':
        permissions.canViewReports = true;
        break;
      case 'workflows_manage':
        permissions.canManageWorkflows = true;
        break;
      case 'messages_manage':
        permissions.canViewMessages = true;
        permissions.canManageMessages = true;
        break;
      case 'files_manage':
        permissions.canViewFiles = true;
        permissions.canManageFiles = true;
        break;
      case 'team_view':
        permissions.canViewTeam = true;
        break;
      case 'portfolio_manage':
        permissions.canViewPortfolio = true;
        permissions.canManagePortfolio = true;
        break;
      case 'erp_view':
        permissions.canViewERP = true;
        break;
      case 'erp_manage':
        permissions.canViewERP = true;
        permissions.canManageERP = true;
        break;
    }
  });

  permissions.delegatedPermissions = delegatedPermissions;

  return permissions;
};

export const useStaffPermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<StaffPermissions>({
    ...getBaseRolePermissions(null) as StaffPermissions,
    role: null,
    delegatedPermissions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions({
          ...getBaseRolePermissions(null) as StaffPermissions,
          role: null,
          delegatedPermissions: [],
        });
        setLoading(false);
        return;
      }

      try {
        // Get user role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user role:', profileError);
          setLoading(false);
          return;
        }

        const userRole = (profile?.role || 'admin') as UserRole;
        let basePermissions = getBaseRolePermissions(userRole);

        // If user is staff, get delegated permissions
        if (userRole === 'staff') {
          const { data: delegated, error: delegatedError } = await supabase
            .rpc('get_user_permissions', { user_id: user.id });

          if (delegatedError) {
            console.error('Error fetching delegated permissions:', delegatedError);
          } else {
            const finalPermissions = applyDelegatedPermissions(basePermissions, delegated || []);
            finalPermissions.role = userRole;
            setPermissions(finalPermissions);
            setLoading(false);
            return;
          }
        }

        // For non-staff users, just use base permissions
        setPermissions({
          ...basePermissions as StaffPermissions,
          role: userRole,
          delegatedPermissions: [],
        });
      } catch (error) {
        console.error('Error in useStaffPermissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();

    // Subscribe to permission changes
    const subscription = supabase
      .channel('staff_permissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_permissions',
          filter: `staff_user_id=eq.${user?.id}`,
        },
        () => {
          console.log('Permission changed, refetching...');
          fetchPermissions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { permissions, loading };
};

// Helper hook to check if user can delegate permissions
export const useCanDelegatePermissions = () => {
  const { permissions } = useStaffPermissions();
  return permissions.isProjectManager || permissions.isAdmin;
};
