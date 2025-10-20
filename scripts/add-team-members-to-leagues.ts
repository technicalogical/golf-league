import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env (or .env.local as fallback)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTeamMembersToLeagues() {
  console.log('\n🔄 Adding team members to their leagues...\n');

  // Get all team members with their team info
  const { data: teamMembers, error: membersError } = await supabase
    .from('team_members')
    .select(`
      user_id,
      team_id,
      team:teams(id, name)
    `);

  if (membersError) {
    console.error('❌ Error fetching team members:', membersError);
    return;
  }

  if (!teamMembers || teamMembers.length === 0) {
    console.log('✅ No team members found.');
    return;
  }

  console.log(`📊 Found ${teamMembers.length} team memberships\n`);

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const member of teamMembers) {
    // Get all leagues this team belongs to
    const { data: leagueTeams, error: leagueError } = await supabase
      .from('league_teams')
      .select('league_id, league:leagues(name)')
      .eq('team_id', member.team_id);

    if (leagueError) {
      console.error(`❌ Error fetching leagues for team ${member.team?.name}:`, leagueError.message);
      errors++;
      continue;
    }

    if (!leagueTeams || leagueTeams.length === 0) {
      console.log(`⚠️  Team ${member.team?.name} is not in any leagues, skipping...`);
      skipped++;
      continue;
    }

    // Add user to each league the team is in
    for (const leagueTeam of leagueTeams) {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('league_members')
        .select('id, role')
        .eq('league_id', leagueTeam.league_id)
        .eq('user_id', member.user_id)
        .single();

      if (existingMember) {
        console.log(`⏭️  User already in league ${leagueTeam.league?.name} with role: ${existingMember.role}`);
        skipped++;
        continue;
      }

      // Add user as player
      const { error: insertError } = await supabase
        .from('league_members')
        .insert({
          league_id: leagueTeam.league_id,
          user_id: member.user_id,
          role: 'player',
        });

      if (insertError) {
        console.error(`❌ Error adding user to league ${leagueTeam.league?.name}:`, insertError.message);
        errors++;
      } else {
        console.log(`✅ Added user to league ${leagueTeam.league?.name} as player`);
        added++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Added: ${added}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}\n`);
}

// Run the migration
addTeamMembersToLeagues()
  .then(() => {
    console.log('✨ Migration complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
