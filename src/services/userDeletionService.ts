// src/services/userDeletionService.ts
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeletionResult {
  success: boolean;
  message: string;
  details?: string[];
  error?: string;
  partialDeletion?: boolean;
  deletedUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface DeletionConfirmation {
  confirmed: boolean;
  userInfo?: {
    name: string;
    email: string;
    role: string;
  };
}

export class UserDeletionService {
  private static baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  /**
   * Get confirmation details before deletion
   */
  static async getConfirmationDetails(userId: string): Promise<DeletionConfirmation> {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', userId)
        .single();

      if (error || !user) {
        toast.error('User not found');
        return { confirmed: false };
      }

      const confirmMessage = `Are you sure you want to PERMANENTLY DELETE this user?

👤 Name: ${user.full_name || 'Not specified'}
📧 Email: ${user.email}
🔐 Role: ${user.role}

⚠️ This action will:
• Delete their profile and auth account
• Remove their projects and service requests  
• Preserve their invoices (unlinked for accounting)
• Delete all their quotes and messages

This CANNOT be undone!`;

      const confirmed = confirm(confirmMessage);

      return {
        confirmed,
        userInfo: confirmed ? {
          name: user.full_name || user.email,
          email: user.email,
          role: user.role
        } : undefined
      };

    } catch (error) {
      console.error('Error getting confirmation details:', error);
      toast.error('Failed to load user information');
      return { confirmed: false };
    }
  }

  /**
   * Delete user with proper backend processing
   */
  static async deleteUser(userId: string): Promise<DeletionResult> {
    try {
      // Get current user for admin verification
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to perform this action'
        };
      }

      // Show loading state
      const loadingToast = toast.loading('Deleting user and related data...', {
        description: 'This may take a moment'
      });

      // Call our backend API endpoint
      const response = await fetch(`${this.baseUrl}/api/admin/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.session?.access_token}`
        },
        body: JSON.stringify({
          userId: userId,
          currentAdminId: currentUser.id
        })
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Deletion failed',
          message: result.message || `HTTP ${response.status}`,
          partialDeletion: result.partialDeletion || false
        };
      }

      return {
        success: true,
        message: result.message,
        details: result.details,
        deletedUser: result.deletedUser
      };

    } catch (error: any) {
      console.error('User deletion service error:', error);
      return {
        success: false,
        error: 'Network error',
        message: 'Failed to connect to deletion service'
      };
    }
  }

  /**
   * Complete deletion workflow with confirmation
   */
  static async deleteUserWithConfirmation(userId: string): Promise<DeletionResult> {
    // Step 1: Get confirmation
    const confirmation = await this.getConfirmationDetails(userId);
    
    if (!confirmation.confirmed) {
      return {
        success: false,
        error: 'Cancelled',
        message: 'User deletion cancelled'
      };
    }

    // Step 2: Perform deletion
    const result = await this.deleteUser(userId);

    // Step 3: Handle result with proper user feedback
    if (result.success) {
      toast.success(result.message, {
        description: `${confirmation.userInfo?.name} has been permanently removed`,
        duration: 5000
      });

      if (result.details && result.details.length > 0) {
        console.log('Deletion details:', result.details);
      }
    } else {
      // Handle different error types
      if (result.partialDeletion) {
        toast.error('Partial deletion occurred', {
          description: `${result.message}. Check logs for details.`,
          duration: 8000
        });
      } else {
        toast.error('Deletion failed', {
          description: result.message,
          duration: 6000
        });
      }

      console.error('Deletion failed:', {
        error: result.error,
        message: result.message,
        partialDeletion: result.partialDeletion
      });
    }

    return result;
  }

  /**
   * Bulk delete multiple users (admin only)
   */
  static async deleteMultipleUsers(userIds: string[]): Promise<DeletionResult[]> {
    const results: DeletionResult[] = [];
    
    if (userIds.length === 0) {
      return results;
    }

    const confirmMessage = `Are you sure you want to delete ${userIds.length} users?
This action cannot be undone and will delete all related data.`;

    if (!confirm(confirmMessage)) {
      return results;
    }

    // Show progress toast
    const progressToast = toast.loading(`Deleting ${userIds.length} users...`);

    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      
      // Update progress
      toast.loading(`Deleting user ${i + 1} of ${userIds.length}...`, {
        id: progressToast
      });

      const result = await this.deleteUser(userId);
      results.push(result);
      
      // Add delay to avoid overwhelming the system
      if (i < userIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    toast.dismiss(progressToast);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (successful > 0 && failed === 0) {
      toast.success(`Successfully deleted ${successful} users`);
    } else if (successful > 0 && failed > 0) {
      toast.warning(`Deleted ${successful} users, ${failed} failed`);
    } else {
      toast.error(`Failed to delete ${failed} users`);
    }

    return results;
  }

  /**
   * Soft delete (deactivate) user instead of hard delete
   */
  static async deactivateUser(userId: string): Promise<DeletionResult> {
    try {
      const { data: user } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      const confirmed = confirm(`Deactivate user ${user?.full_name || user?.email}?
This will suspend their access but preserve their data.`);

      if (!confirmed) {
        return {
          success: false,
          error: 'Cancelled',
          message: 'Deactivation cancelled'
        };
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return {
          success: false,
          error: 'Database error',
          message: error.message
        };
      }

      toast.success('User deactivated successfully');
      
      return {
        success: true,
        message: `User ${user?.full_name || user?.email} has been deactivated`
      };

    } catch (error: any) {
      return {
        success: false,
        error: 'Unexpected error',
        message: error.message
      };
    }
  }
}

// Export convenience function for direct use
export const deleteUserWithConfirmation = UserDeletionService.deleteUserWithConfirmation;
export const deactivateUser = UserDeletionService.deactivateUser;
