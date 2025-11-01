import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSiteAdmin() {
  const email = 'lehman.brandon@gmail.com';

  console.log(`\nChecking site admin status for ${email}...\n`);

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, name, display_name, is_site_admin')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!profile) {
    console.log('Profile not found');
    return;
  }

  console.log('Profile found:');
  console.log(`  Name: ${profile.display_name || profile.name || 'N/A'}`);
  console.log(`  Email: ${profile.email}`);
  console.log(`  User ID: ${profile.id}`);
  console.log(`  Site Admin: ${profile.is_site_admin ? 'YES ✓' : 'NO ✗'}`);

  if (!profile.is_site_admin) {
    console.log('\n⚠️  This user is NOT a site admin.');
    console.log('To make this user a site admin, we need to update the database.');
  } else {
    console.log('\n✓ This user IS a site admin and can access /admin/courses');
  }
}

checkSiteAdmin();
