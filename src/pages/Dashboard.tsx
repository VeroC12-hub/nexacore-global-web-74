import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernClientPortal } from '@/components/client/ModernClientPortal';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

const Dashboard: React.FC = () => {
  const { user, loading } = useEnhancedAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Redirect non-client roles to their appropriate dashboards
    const adminRoles = ['admin', 'project_manager', 'operations_manager'];
    const staffRoles = ['developer', 'support', 'staff'];

    if (adminRoles.includes(user.role)) {
      navigate('/admin', { replace: true });
    } else if (staffRoles.includes(user.role)) {
      navigate('/staff', { replace: true });
    }
    // Clients stay on this page
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return <ModernClientPortal />;
};

export default Dashboard;
