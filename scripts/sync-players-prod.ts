import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmbtlibjgnxdluawlmcw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYnRsaWJqZ254ZGx1YXdsbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg3MTAzNSwiZXhwIjoyMDc2NDQ3MDM1fQ.lnR0HYhzqhmUsZdMFSJhTpE90_G1fqQLxlI3ulhLh4w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncPlayersProd() {
  console.log('\n🔧 PRODUCTION DATABASE');
  console.log('Starting player sync process...\n');

  let playersCreated = 0;
  let playersSkipped = 0;
  let leagueMembersCreated = 0;
  let leagueMembersSkipped = 0;

  // Get all team members with their team and profile info
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select(`
      *,
      team:teams(id, name),
      profile:profiles(id, name, display_name, email)
    `);

  if (!teamMembers) {
    console.error('❌ No team members found');
    return;
  }

  console.log(`Found ${teamMembers.length} team members\n`);

  // For each team member, check if they have a player record
  for (const tm of teamMembers) {
    // Check if player already exists for this user on this team
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('team_id', tm.team_id)
      .eq('user_id', tm.user_id)
      .single();

    if (existingPlayer) {
      playersSkipped++;
    } else {
      // Create player record
      const playerName = tm.profile?.display_name || tm.profile?.name || tm.profile?.email || 'Player';

      const { error: playerError } = await supabase
        .from('players')
        .insert({
          team_id: tm.team_id,
          user_id: tm.user_id,
          name: playerName,
          handicap: 18, // Default handicap, can be updated later
          is_active: true,
        });

      if (playerError) {
        console.error(`❌ Error creating player for ${playerName}:`, playerError.message);
      } else {
        console.log(`✓ Created player: ${playerName} for team ${tm.team?.name}`);
        playersCreated++;
      }
    }
  }

  // Now sync league memberships
  const { data: leagueTeams } = await supabase
    .from('league_teams')
    .select(`
      league_id,
      team_id
    `);

  if (leagueTeams) {
    // For each league-team combo, add all team members as league members
    for (const lt of leagueTeams) {
      // Get team members for this team
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', lt.team_id);

      if (members) {
        for (const member of members) {
          // Check if league membership already exists
          const { data: existingMembership } = await supabase
            .from('league_members')
            .select('id')
            .eq('league_id', lt.league_id)
            .eq('user_id', member.user_id)
            .single();

          if (existingMembership) {
            leagueMembersSkipped++;
          } else {
            // Create league membership with 'player' role
            const { error: memberError } = await supabase
              .from('league_members')
              .insert({
                league_id: lt.league_id,
                user_id: member.user_id,
                role: 'player',
              });

            if (memberError) {
              console.error('❌ Error creating league member:', memberError.message);
            } else {
              leagueMembersCreated++;
            }
          }
        }
      }
    }
  }

  console.log('\n=== PRODUCTION SYNC COMPLETE ===');
  console.log(`✓ Players created: ${playersCreated}`);
  console.log(`  Players skipped: ${playersSkipped}`);
  console.log(`✓ League members created: ${leagueMembersCreated}`);
  console.log(`  League members skipped: ${leagueMembersSkipped}`);
}

syncPlayersProd();
