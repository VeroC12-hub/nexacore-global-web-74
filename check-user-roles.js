// Check current user roles and their access levels
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nmwfevhetlwehbuikflk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2ZldmhldGx3ZWhidWlrZmxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzOTcwMiwiZXhwIjoyMDY5OTE1NzAyfQ.-cwsU0QF6dMYdaEbvyaHEDguTJoTLEm8wAsJQwBzYVI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserRoles() {
  console.log('👥 Checking User Roles and Access Levels\n');

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error fetching profiles:', error);
      return;
    }

    console.log(`Found ${profiles.length} user profiles:\n`);

    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name || 'No name'}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Status: ${profile.status}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Created: ${new Date(profile.created_at).toLocaleDateString()}`);
      console.log('   ---');
    });

    // Analyze roles and access levels
    const roleAnalysis = profiles.reduce((acc, profile) => {
      if (!acc[profile.role]) {
        acc[profile.role] = [];
      }
      acc[profile.role].push(profile);
      return acc;
    }, {});

    console.log('\n📊 Role Analysis:');
    Object.entries(roleAnalysis).forEach(([role, users]) => {
      console.log(`\n${role.toUpperCase()}: ${users.length} user(s)`);
      users.forEach(user => {
        console.log(`  - ${user.full_name || user.email}`);
      });
    });

    // Security recommendations
    console.log('\n🔒 PAYMENT CONFIGURATION ACCESS SECURITY:');
    console.log('\n✅ Should have FULL payment access:');
    const adminUsers = profiles.filter(p => p.role === 'admin');
    adminUsers.forEach(admin => {
      console.log(`  - ${admin.full_name} (${admin.email}) - Admin`);
    });

    console.log('\n❌ Should NOT have payment configuration access:');
    const nonAdminUsers = profiles.filter(p => p.role !== 'admin');
    nonAdminUsers.forEach(user => {
      console.log(`  - ${user.full_name} (${user.email}) - ${user.role}`);
    });

    console.log('\n🛡️ SECURITY REQUIREMENTS:');
    console.log('1. Only admin role can access payment configuration');
    console.log('2. Other roles (operations_manager, project_manager, staff, member) should be blocked');
    console.log('3. Navigation should hide payment config for non-admins');
    console.log('4. API calls should verify admin role before allowing access');
    console.log('5. Database RLS policies should enforce admin-only access');

  } catch (error) {
    console.log('❌ Error:', error);
  }
}

checkUserRoles().catch(console.error);