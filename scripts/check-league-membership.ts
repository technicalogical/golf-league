import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scwkwwehjnlfjyfjpzoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2t3d2Voam5sZmp5Zmpwem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcwNzU0OCwiZXhwIjoyMDc2MjgzNTQ4fQ.sja0KXb62sB30sA0W5-9PCDWZaVzQE2nFSKDWmNSyvw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMembership() {
  const leagueId = '00c9cc35-f776-4828-b4d4-0338deb303cb';

  console.log(`\nChecking league ${leagueId}...\n`);

  // Get all members of this league
  const { data: members, error } = await supabase
    .from('league_members')
    .select('user_id, role, profiles(email, name, display_name)')
    .eq('league_id', leagueId);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${members?.length || 0} members:\n`);

  members?.forEach((member: any) => {
    const email = member.profiles?.email || 'unknown';
    const name = member.profiles?.display_name || member.profiles?.name || 'unknown';
    console.log(`- ${name} (${email})`);
    console.log(`  User ID: ${member.user_id}`);
    console.log(`  Role: ${member.role}\n`);
  });
}

checkMembership();
