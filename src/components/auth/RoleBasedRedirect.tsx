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
    
    // Get user's role from the enhanced user object
    const userRole = user.role;
    
    // Define role-based redirects
    const roleRedirects: Record<string, string> = {
      'admin': '/admin',
      'project_manager': '/admin',
      'operations_manager': '/admin',
      'developer': '/staff',
      'support': '/staff',
      'staff': '/staff',
      'client': '/dashboard',
      'member': '/dashboard' // Default member role goes to client dashboard
    };

    const targetPath = roleRedirects[userRole] || '/dashboard';
    
    // Only redirect from auth pages or root after login
    if (currentPath === '/auth' || currentPath === '/login') {
      navigate(targetPath, { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  return <>{children}</>;
}