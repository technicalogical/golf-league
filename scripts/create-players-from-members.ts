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

async function createPlayersFromMembers() {
  console.log('\n🔄 Creating player records for existing team members...\n');

  // Get all team members
  const { data: teamMembers, error: membersError } = await supabase
    .from('team_members')
    .select(`
      *,
      profile:profiles(name, email),
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

  console.log(`📊 Found ${teamMembers.length} team members\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const member of teamMembers) {
    // Check if player already exists
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('user_id', member.user_id)
      .eq('team_id', member.team_id)
      .single();

    if (existingPlayer) {
      console.log(`⏭️  Skipping ${member.profile?.name} - player already exists`);
      skipped++;
      continue;
    }

    // Create player record
    const playerName = member.profile?.name || member.profile?.email || 'Unknown Player';

    const { error: playerError } = await supabase
      .from('players')
      .insert({
        name: playerName,
        team_id: member.team_id,
        user_id: member.user_id,
        handicap: 0, // Default handicap
        is_active: true,
      });

    if (playerError) {
      console.error(`❌ Error creating player for ${playerName}:`, playerError.message);
      errors++;
    } else {
      console.log(`✅ Created player: ${playerName} for team ${member.team?.name}`);
      created++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}\n`);
}

// Run the migration
createPlayersFromMembers()
  .then(() => {
    console.log('✨ Migration complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
