import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernClientPortal } from '@/components/client/ModernClientPortal';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

const ADMIN_ROLES = ['admin', 'project_manager', 'operations_manager'];
const STAFF_ROLES = ['developer', 'support', 'staff'];

const Dashboard: React.FC = () => {
  const { user, loading } = useEnhancedAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (ADMIN_ROLES.includes(user.role)) {
      navigate('/admin', { replace: true });
    } else if (STAFF_ROLES.includes(user.role)) {
      navigate('/staff', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show spinner while loading OR while redirecting non-client roles
  if (loading || !user || ADMIN_ROLES.includes(user?.role) || STAFF_ROLES.includes(user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only clients reach here
  return <ModernClientPortal />;
};

export default Dashboard;
