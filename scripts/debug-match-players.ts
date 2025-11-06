import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmbtlibjgnxdluawlmcw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYnRsaWJqZ254ZGx1YXdsbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg3MTAzNSwiZXhwIjoyMDc2NDQ3MDM1fQ.lnR0HYhzqhmUsZdMFSJhTpE90_G1fqQLxlI3ulhLh4w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugMatchPlayers() {
  const matchId = 'd6fbaf59-d15d-49f0-ab49-0839bb326848';

  console.log(`\nDebugging match: ${matchId}\n`);

  // Get match details
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select(`
      id,
      team1_id,
      team2_id,
      status,
      team1:teams!matches_team1_id_fkey(id, name),
      team2:teams!matches_team2_id_fkey(id, name)
    `)
    .eq('id', matchId)
    .single();

  if (matchError) {
    console.error('Error fetching match:', matchError);
    return;
  }

  console.log('Match Details:');
  console.log(`  Team 1: ${match.team1?.name} (${match.team1_id})`);
  console.log(`  Team 2: ${match.team2?.name} (${match.team2_id})`);
  console.log(`  Status: ${match.status}\n`);

  // Get players for team1
  const { data: team1Players, error: t1Error } = await supabase
    .from('players')
    .select('id, name, team_id, user_id, handicap')
    .eq('team_id', match.team1_id)
    .eq('is_active', true);

  console.log(`Team 1 Players (${team1Players?.length || 0}):`);
  team1Players?.forEach((p: any) => {
    console.log(`  - ${p.name} (ID: ${p.id}, User: ${p.user_id}, HCP: ${p.handicap})`);
  });

  // Get players for team2
  const { data: team2Players, error: t2Error } = await supabase
    .from('players')
    .select('id, name, team_id, user_id, handicap')
    .eq('team_id', match.team2_id)
    .eq('is_active', true);

  console.log(`\nTeam 2 Players (${team2Players?.length || 0}):`);
  team2Players?.forEach((p: any) => {
    console.log(`  - ${p.name} (ID: ${p.id}, User: ${p.user_id}, HCP: ${p.handicap})`);
  });

  // Check what the API would return
  const allPlayers = [...(team1Players || []), ...(team2Players || [])];
  console.log(`\nTotal Players: ${allPlayers.length}`);
  console.log('Expected: 4 players (2 per team)');

  if (allPlayers.length < 4) {
    console.log('\n⚠️  PROBLEM: Not enough players!');
    console.log('Possible causes:');
    console.log('  - Players not created for team members');
    console.log('  - Players marked as inactive');
    console.log('  - Team members not properly linked to players table');
  }

  // Check team members
  console.log('\n--- Team Members Check ---');
  const { data: team1Members } = await supabase
    .from('team_members')
    .select('user_id, profiles(name, email)')
    .eq('team_id', match.team1_id);

  console.log(`\nTeam 1 Members (${team1Members?.length || 0}):`);
  team1Members?.forEach((m: any) => {
    console.log(`  - ${m.profiles?.name || m.profiles?.email} (User: ${m.user_id})`);
  });

  const { data: team2Members } = await supabase
    .from('team_members')
    .select('user_id, profiles(name, email)')
    .eq('team_id', match.team2_id);

  console.log(`\nTeam 2 Members (${team2Members?.length || 0}):`);
  team2Members?.forEach((m: any) => {
    console.log(`  - ${m.profiles?.name || m.profiles?.email} (User: ${m.user_id})`);
  });
}

debugMatchPlayers();
