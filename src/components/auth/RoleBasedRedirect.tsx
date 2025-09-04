import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const { user, loading } = useEnhancedAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading or no user
    if (loading || !user) return;

    // Don't redirect if user is already on appropriate page
    const currentPath = location.pathname;
    
    // Define role-based redirects
    const roleRedirects: Record<string, string> = {
      'admin': '/staff',
      'project_manager': '/staff', 
      'operations_manager': '/staff',
      'developer': '/staff',
      'support': '/staff',
      'client': '/dashboard' // or /client-portal
    };

    const targetPath = roleRedirects[user.role];
    
    // Only redirect if not already on the target path or a sub-path
    if (targetPath && !currentPath.startsWith(targetPath)) {
      // Special handling for root dashboard redirect
      if (currentPath === '/dashboard' && user.role !== 'client') {
        navigate('/staff', { replace: true });
      }
      // Special handling for client portal redirect
      else if (currentPath === '/client-portal' && user.role !== 'client') {
        navigate('/staff', { replace: true });
      }
      // General redirect for users accessing inappropriate areas
      else if (currentPath === '/' || currentPath === '/login' || currentPath === '/auth') {
        navigate(targetPath, { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  return <>{children}</>;
}