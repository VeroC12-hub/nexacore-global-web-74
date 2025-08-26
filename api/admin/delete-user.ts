// api/admin/delete-user.ts
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // This has full permissions
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, currentAdminId } = req.body;

    // Validate input
    if (!userId || !currentAdminId) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId and currentAdminId' 
      });
    }

    // Prevent self-deletion
    if (userId === currentAdminId) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account' 
      });
    }

    // Verify admin permissions
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', currentAdminId)
      .single();

    if (adminError || !adminProfile || adminProfile.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Insufficient permissions. Admin access required.' 
      });
    }

    // Get target user info
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !targetUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Check for related data and handle accordingly
    const { data: relatedData, error: checkError } = await supabaseAdmin
      .rpc('check_user_related_data', { user_id: userId });

    if (checkError) {
      console.error('Error checking related data:', checkError);
    }

    // Step 1: Handle related data with proper cascading
    const deletionSteps = [];

    try {
      // Delete user's project messages
      const { error: messagesError } = await supabaseAdmin
        .from('project_messages')
        .delete()
        .eq('sender_id', userId);

      if (messagesError) {
        deletionSteps.push(`Messages deletion failed: ${messagesError.message}`);
      } else {
        deletionSteps.push('Messages deleted successfully');
      }

      // Delete user's service requests
      const { error: requestsError } = await supabaseAdmin
        .from('service_requests')
        .delete()
        .eq('client_id', userId);

      if (requestsError) {
        deletionSteps.push(`Service requests deletion failed: ${requestsError.message}`);
      } else {
        deletionSteps.push('Service requests deleted successfully');
      }

      // Handle projects - reassign or delete based on business logic
      const { data: userProjects } = await supabaseAdmin
        .from('projects')
        .select('id, title')
        .eq('client_id', userId);

      if (userProjects && userProjects.length > 0) {
        // Option 1: Delete projects (if no critical data)
        const { error: projectsError } = await supabaseAdmin
          .from('projects')
          .delete()
          .eq('client_id', userId);

        if (projectsError) {
          deletionSteps.push(`Projects deletion failed: ${projectsError.message}`);
        } else {
          deletionSteps.push(`${userProjects.length} projects deleted`);
        }
      }

      // Handle invoices - these should generally be preserved for accounting
      const { data: userInvoices } = await supabaseAdmin
        .from('invoices')
        .select('id, invoice_number')
        .eq('client_id', userId);

      if (userInvoices && userInvoices.length > 0) {
        // Preserve invoices but mark as archived
        const { error: invoicesError } = await supabaseAdmin
          .from('invoices')
          .update({ 
            client_id: null, 
            notes: `Original client deleted on ${new Date().toISOString()}` 
          })
          .eq('client_id', userId);

        if (invoicesError) {
          deletionSteps.push(`Invoices update failed: ${invoicesError.message}`);
        } else {
          deletionSteps.push(`${userInvoices.length} invoices preserved and unlinked`);
        }
      }

      // Delete quotes
      const { error: quotesError } = await supabaseAdmin
        .from('quotes')
        .delete()
        .eq('client_email', targetUser.email);

      if (quotesError) {
        deletionSteps.push(`Quotes deletion failed: ${quotesError.message}`);
      } else {
        deletionSteps.push('Quotes deleted successfully');
      }

      // Delete quote requests
      const { error: quoteRequestsError } = await supabaseAdmin
        .from('quote_requests')
        .delete()
        .eq('email', targetUser.email);

      if (quoteRequestsError) {
        deletionSteps.push(`Quote requests deletion failed: ${quoteRequestsError.message}`);
      } else {
        deletionSteps.push('Quote requests deleted successfully');
      }

      // Step 2: Delete from profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw new Error(`Profile deletion failed: ${profileError.message}`);
      }

      deletionSteps.push('Profile deleted successfully');

      // Step 3: Delete from Supabase Auth (this requires service role)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) {
        // This is critical - if auth user remains, they can still log in
        throw new Error(`Auth user deletion failed: ${authError.message}`);
      }

      deletionSteps.push('Auth user deleted successfully');

      return res.status(200).json({
        success: true,
        message: `User ${targetUser.full_name || targetUser.email} deleted successfully`,
        details: deletionSteps,
        deletedUser: {
          id: targetUser.id,
          name: targetUser.full_name,
          email: targetUser.email
        }
      });

    } catch (deletionError: any) {
      // If any critical step fails, return detailed error
      return res.status(500).json({
        error: 'User deletion failed',
        message: deletionError.message,
        completedSteps: deletionSteps,
        partialDeletion: true
      });
    }

  } catch (error: any) {
    console.error('User deletion error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}
