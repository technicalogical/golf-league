import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmbtlibjgnxdluawlmcw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYnRsaWJqZ254ZGx1YXdsbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg3MTAzNSwiZXhwIjoyMDc2NDQ3MDM1fQ.lnR0HYhzqhmUsZdMFSJhTpE90_G1fqQLxlI3ulhLh4w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugMatch() {
  const matchId = '6141939f-8613-4cd7-aa84-9bcfbbbe57dc';

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
  console.log(`  Team 1 ID: ${match.team1_id}`);
  console.log(`  Team 1 Name: ${match.team1?.name}`);
  console.log(`  Team 2 ID: ${match.team2_id}`);
  console.log(`  Team 2 Name: ${match.team2?.name}`);
  console.log(`  Status: ${match.status}\n`);

  // Get ALL players for both teams
  const { data: allPlayers } = await supabase
    .from('players')
    .select('id, name, team_id, user_id, handicap, is_active')
    .in('team_id', [match.team1_id, match.team2_id]);

  console.log(`All Players (${allPlayers?.length || 0}):`);
  allPlayers?.forEach((p: any) => {
    const teamName = p.team_id === match.team1_id ? match.team1?.name : match.team2?.name;
    console.log(`  - ${p.name} | Team: ${teamName} (${p.team_id}) | Active: ${p.is_active} | HCP: ${p.handicap}`);
  });

  // Get players by team
  const team1Players = allPlayers?.filter(p => p.team_id === match.team1_id) || [];
  const team2Players = allPlayers?.filter(p => p.team_id === match.team2_id) || [];

  console.log(`\nTeam 1 (${match.team1?.name}): ${team1Players.length} players`);
  team1Players.forEach(p => console.log(`  - ${p.name}`));

  console.log(`\nTeam 2 (${match.team2?.name}): ${team2Players.length} players`);
  team2Players.forEach(p => console.log(`  - ${p.name}`));

  // Check the API response format
  console.log('\n--- What the API returns ---');
  const playersForAPI = [
    ...team1Players.map((p: any) => ({ ...p, team_name: match.team1?.name })),
    ...team2Players.map((p: any) => ({ ...p, team_name: match.team2?.name }))
  ];

  console.log(`Total players in API response: ${playersForAPI.length}`);
  playersForAPI.forEach((p: any, idx: number) => {
    console.log(`  ${idx}: ${p.name} (team_id: ${p.team_id}, team_name: ${p.team_name})`);
  });

  // Test the grouping logic
  const teamIds = Array.from(new Set(playersForAPI.map((p: any) => p.team_id)));
  console.log(`\n--- Team Grouping Test ---`);
  console.log(`Unique team IDs: ${teamIds.length}`);
  console.log(`  Team 1 ID: ${teamIds[0]}`);
  console.log(`  Team 2 ID: ${teamIds[1]}`);

  const grouped1 = playersForAPI.filter((p: any) => p.team_id === teamIds[0]);
  const grouped2 = playersForAPI.filter((p: any) => p.team_id === teamIds[1]);

  console.log(`Team ${teamIds[0]} players: ${grouped1.length}`);
  grouped1.forEach((p: any) => console.log(`  - ${p.name}`));
  console.log(`Team ${teamIds[1]} players: ${grouped2.length}`);
  grouped2.forEach((p: any) => console.log(`  - ${p.name}`));
}

debugMatch();
