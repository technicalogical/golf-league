import { createClient } from '@supabase/supabase-js';

// Production Supabase credentials
const supabaseUrl = 'https://pmbtlibjgnxdluawlmcw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYnRsaWJqZ254ZGx1YXdsbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg3MTAzNSwiZXhwIjoyMDc2NDQ3MDM1fQ.lnR0HYhzqhmUsZdMFSJhTpE90_G1fqQLxlI3ulhLh4w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeSiteAdminProd() {
  const email = 'lehman.brandon@gmail.com';

  console.log(`\n🔧 PRODUCTION DATABASE`);
  console.log(`Making ${email} a site admin...\n`);

  // First, find the user
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email, name, display_name, is_site_admin')
    .eq('email', email)
    .single();

  if (fetchError || !profile) {
    console.error('❌ Error finding profile:', fetchError);
    return;
  }

  console.log('Current status:');
  console.log(`  Name: ${profile.display_name || profile.name || 'N/A'}`);
  console.log(`  Email: ${profile.email}`);
  console.log(`  Site Admin: ${profile.is_site_admin ? 'YES' : 'NO'}\n`);

  if (profile.is_site_admin) {
    console.log('✓ User is already a site admin on production!');
    return;
  }

  // Update to site admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_site_admin: true })
    .eq('id', profile.id);

  if (updateError) {
    console.error('❌ Error updating profile:', updateError);
    return;
  }

  console.log('✅ Successfully made user a site admin on PRODUCTION!');
  console.log('\nThe Admin Tools section will now appear on your production dashboard.');
  console.log('You can access course management at: https://golf.technicalogical.com/admin/courses');
}

makeSiteAdminProd();
