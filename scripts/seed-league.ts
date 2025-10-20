import { faker } from '@faker-js/faker';
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
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedLeague() {
  console.log('\n🌱 Creating test league with teams...\n');

  // Get available users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  if (profilesError || !profiles || profiles.length < 8) {
    console.error('❌ Need at least 8 users. Run seed-users.ts first.');
    return;
  }

  console.log(`✅ Found ${profiles.length} users available\n`);

  // Create a league
  const leagueName = `${faker.location.city()} Golf League`;
  const startDate = new Date('2025-04-01');
  const endDate = new Date('2025-10-31');

  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert({
      name: leagueName,
      description: `A competitive golf league in the ${faker.location.city()} area. Join us every week for friendly competition!`,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
      created_by: profiles[0].id,
      league_day: 'Thursday',
      league_time: '18:00:00',
      is_public: true,
      registration_open: true,
    })
    .select()
    .single();

  if (leagueError) {
    console.error('❌ Error creating league:', leagueError);
    return;
  }

  console.log(`🏌️  Created league: ${league.name}\n`);

  // Make the creator a league admin
  await supabase.from('league_members').insert({
    league_id: league.id,
    user_id: profiles[0].id,
    role: 'admin',
  });

  // Get or create a course
  const { data: existingCourse } = await supabase
    .from('courses')
    .select('*')
    .limit(1)
    .single();

  let course;
  if (existingCourse) {
    course = existingCourse;
    console.log(`🏌️  Using existing course: ${course.name}\n`);
  } else {
    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert({
        name: `${faker.location.city()} Country Club`,
        location: `${faker.location.city()}, ${faker.location.state()}`,
        par: 72,
      })
      .select()
      .single();

    if (courseError) {
      console.error('❌ Error creating course:', courseError);
      return;
    }
    course = newCourse;
    console.log(`🏌️  Created course: ${course.name}\n`);
  }

  // Create 4 teams with 2 players each (8 total players)
  const teamNames = [
    'Eagles',
    'Birdies',
    'Aces',
    'Drivers',
  ];

  const teams = [];
  for (let i = 0; i < 4; i++) {
    const teamName = `${faker.color.human()} ${teamNames[i]}`;

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: teamName,
        is_active: true,
        created_by: profiles[i * 2].id,
        captain_id: profiles[i * 2].id,
        invite_code: faker.string.alphanumeric(8).toUpperCase(),
      })
      .select()
      .single();

    if (teamError) {
      console.error('❌ Error creating team:', teamError);
      continue;
    }

    // Link team to league via junction table
    await supabase.from('league_teams').insert({
      league_id: league.id,
      team_id: team.id,
    });

    teams.push(team);
    console.log(`⛳ Created team: ${team.name}`);

    // Assign 2 players to this team
    const player1 = profiles[i * 2];
    const player2 = profiles[i * 2 + 1];

    // Generate realistic golf handicaps (0-36)
    const handicap1 = faker.number.int({ min: 0, max: 36 });
    const handicap2 = faker.number.int({ min: 0, max: 36 });

    // Create players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .insert([
        {
          name: player1.name,
          handicap: handicap1,
          team_id: team.id,
          user_id: player1.id,
          is_active: true,
        },
        {
          name: player2.name,
          handicap: handicap2,
          team_id: team.id,
          user_id: player2.id,
          is_active: true,
        },
      ])
      .select();

    if (!playersError && players) {
      console.log(`   👤 ${player1.name} (HCP: ${handicap1})`);
      console.log(`   👤 ${player2.name} (HCP: ${handicap2})`);
    }

    // Add team members (link profiles to teams)
    await supabase.from('team_members').insert([
      {
        team_id: team.id,
        user_id: player1.id,
        role: i === 0 ? 'captain' : 'member',
      },
      {
        team_id: team.id,
        user_id: player2.id,
        role: 'member',
      },
    ]);

    console.log('');
  }

  console.log(`✨ League setup complete!\n`);
  console.log(`📊 Summary:`);
  console.log(`   League: ${league.name}`);
  console.log(`   Teams: ${teams.length}`);
  console.log(`   Players: ${teams.length * 2}`);
  console.log(`   Course: ${course.name}\n`);

  return { league, teams, course };
}

// Run the seed function
seedLeague()
  .then(() => {
    console.log('✅ League seeding complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
