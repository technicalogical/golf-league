import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeSiteAdmin() {
  const email = 'lehman.brandon@gmail.com';

  console.log(`\nMaking ${email} a site admin...\n`);

  // First, find the user
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email, name, display_name, is_site_admin')
    .eq('email', email)
    .single();

  if (fetchError || !profile) {
    console.error('Error finding profile:', fetchError);
    return;
  }

  console.log('Current status:');
  console.log(`  Name: ${profile.display_name || profile.name || 'N/A'}`);
  console.log(`  Email: ${profile.email}`);
  console.log(`  Site Admin: ${profile.is_site_admin ? 'YES' : 'NO'}\n`);

  if (profile.is_site_admin) {
    console.log('✓ User is already a site admin!');
    return;
  }

  // Update to site admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_site_admin: true })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating profile:', updateError);
    return;
  }

  console.log('✓ Successfully made user a site admin!');
  console.log('\nThe Admin Tools section will now appear on the dashboard.');
  console.log('You can access course management at: /admin/courses');
}

makeSiteAdmin();
