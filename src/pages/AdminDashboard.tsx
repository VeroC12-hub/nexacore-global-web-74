import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernAdminDashboard } from '@/components/admin/ModernAdminDashboard';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

const ADMIN_ROLES = ['admin', 'project_manager', 'operations_manager'];

const AdminDashboard: React.FC = () => {
  const { user, loading } = useEnhancedAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    if (!ADMIN_ROLES.includes(user.role)) {
      if (user.role === 'developer' || user.role === 'support') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading || !user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <ModernAdminDashboard />;
};

export default AdminDashboard;
