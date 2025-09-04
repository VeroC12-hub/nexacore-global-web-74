import React from 'react';
import { ModernStaffDashboard } from '@/components/staff/ModernStaffDashboard';
import { ProtectedRoute } from '@/hooks/useEnhancedAuth';

export default function StaffDashboardPage() {
  return (
    <ProtectedRoute 
      requireAuth={true}
      requiredRoles={['admin', 'project_manager', 'operations_manager', 'developer', 'support']}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Staff Access Only</h2>
            <p className="text-muted-foreground mb-4">
              This area is restricted to NexaCore staff members only.
            </p>
            <p className="text-sm text-muted-foreground">
              If you're a client, please use the <a href="/dashboard" className="text-primary hover:underline">client portal</a>.
            </p>
          </div>
        </div>
      }
    >
      <ModernStaffDashboard />
    </ProtectedRoute>
  );
}