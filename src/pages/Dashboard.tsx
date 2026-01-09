import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModernClientPortal } from '@/components/client/ModernClientPortal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Get user role
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = data?.role;

      // Redirect to appropriate dashboard based on role
      const adminRoles = ['admin', 'project_manager', 'operations_manager'];
      const staffRoles = ['developer', 'support', 'staff'];

      if (role && adminRoles.includes(role)) {
        navigate('/admin', { replace: true });
      } else if (role && staffRoles.includes(role)) {
        navigate('/staff', { replace: true });
      }
    };

    checkUserRole();
  }, [user, navigate]);

  return <ModernClientPortal />;
};

export default Dashboard;