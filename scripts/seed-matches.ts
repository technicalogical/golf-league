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
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to generate realistic golf scores
function generateScore(par: number, handicap: number): number {
  // Lower handicap = better scores
  const skillFactor = Math.max(0, (36 - handicap) / 36);
  const baseScore = par + faker.number.int({ min: -1, max: 3 });
  const adjustment = faker.number.int({ min: -2, max: 2 }) * (1 - skillFactor);
  return Math.max(par - 2, Math.round(baseScore + adjustment));
}

// Calculate strokes given on hole based on handicap
function getStrokesGiven(handicap: number, holeIndex: number, holePar: number): number {
  if (holePar === 3) return 0; // No strokes on par 3s
  if (handicap >= holeIndex) return 1;
  if (handicap >= holeIndex + 18) return 2;
  return 0;
}

async function seedMatches(matchCount: number = 3) {
  console.log(`\n🌱 Creating ${matchCount} test matches...\n`);

  // Get the most recent league
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (leagueError || !league) {
    console.error('❌ No league found. Run seed-league.ts first.');
    return;
  }

  // Get teams from the league via league_teams junction table
  const { data: leagueTeams, error: leagueTeamsError } = await supabase
    .from('league_teams')
    .select('team_id, teams!inner(*)')
    .eq('league_id', league.id);

  if (leagueTeamsError || !leagueTeams || leagueTeams.length < 2) {
    console.error('❌ Need at least 2 teams. Run seed-league.ts first.');
    return;
  }

  // Extract teams and fetch their players
  const teamIds = leagueTeams.map((lt: any) => lt.team_id);
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*, players(*)')
    .in('id', teamIds)
    .eq('is_active', true);

  if (teamsError || !teams || teams.length < 2) {
    console.error('❌ Error loading teams.');
    return;
  }

  // Get a course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .limit(1)
    .single();

  if (courseError || !course) {
    console.error('❌ No course found.');
    return;
  }

  // Get or create holes for the course
  let { data: holes } = await supabase
    .from('holes')
    .select('*')
    .eq('course_id', course.id)
    .order('hole_number');

  if (!holes || holes.length === 0) {
    console.log('📌 Creating holes for course...\n');

    // Standard par distribution for 18 holes
    const parDistribution = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5];
    const handicapIndexes = [7, 3, 15, 1, 11, 9, 17, 5, 13, 8, 16, 4, 2, 12, 10, 18, 6, 14];

    const holesData = parDistribution.map((par, index) => ({
      course_id: course.id,
      hole_number: index + 1,
      par: par,
      handicap_index: handicapIndexes[index],
    }));

    const { data: newHoles, error: holesError } = await supabase
      .from('holes')
      .insert(holesData)
      .select();

    if (holesError) {
      console.error('❌ Error creating holes:', holesError);
      return;
    }

    holes = newHoles;
  }

  console.log(`✅ Using league: ${league.name}`);
  console.log(`✅ Found ${teams.length} teams with players\n`);

  // Create matches
  for (let i = 0; i < matchCount; i++) {
    // Pick two random teams
    const team1 = teams[i % teams.length];
    const team2 = teams[(i + 1) % teams.length];

    if (team1.id === team2.id) continue;

    // Match date (in the past few weeks)
    const matchDate = faker.date.recent({ days: 30 });

    console.log(`⛳ Creating match: ${team1.name} vs ${team2.name}`);
    console.log(`   Date: ${matchDate.toDateString()}`);

    // Create match
    const { data: match, error: matchError} = await supabase
      .from('matches')
      .insert({
        league_id: league.id,
        team1_id: team1.id,
        team2_id: team2.id,
        course_id: course.id,
        match_date: matchDate.toISOString().split('T')[0],
        status: 'in_progress',
        holes_to_play: 18,
        tee_selection: 'Blue',
        stimp_setting: faker.number.float({ min: 9.0, max: 12.0, fractionDigits: 1 }),
        pin_placement: faker.helpers.arrayElement(['Novice', 'Intermediate', 'Advanced']),
        week_number: i + 1,
      })
      .select()
      .single();

    if (matchError) {
      console.error('❌ Error creating match:', matchError);
      continue;
    }

    // Get players for both teams (2 per team)
    const team1Players = team1.players.slice(0, 2);
    const team2Players = team2.players.slice(0, 2);
    const allPlayers = [...team1Players, ...team2Players];

    // Create scorecards for all 4 players
    const scorecards = [];
    for (const player of allPlayers) {
      const { data: scorecard, error: scorecardError } = await supabase
        .from('scorecards')
        .insert({
          match_id: match.id,
          player_id: player.id,
          handicap_at_time: player.handicap,
          total_score: 0,
          points_earned: 0,
        })
        .select()
        .single();

      if (scorecardError) {
        console.error('❌ Error creating scorecard:', scorecardError);
        continue;
      }

      scorecards.push({ ...scorecard, player, teamId: player.team_id });
    }

    // Check that we have all 4 scorecards
    if (scorecards.length !== 4) {
      console.error(`❌ Failed to create all scorecards (got ${scorecards.length}/4)`);
      continue;
    }

    // Generate hole scores for all players
    let team1TotalPoints = 0;
    let team2TotalPoints = 0;

    for (const hole of holes) {
      const holeScores = [];

      // Generate scores for all 4 players
      for (const sc of scorecards) {
        const strokes = generateScore(hole.par, sc.player.handicap);
        const strokesGiven = getStrokesGiven(sc.handicap_at_time, hole.handicap_index, hole.par);
        const netStrokes = strokes - strokesGiven;

        holeScores.push({
          scorecard: sc,
          strokes,
          netStrokes,
          strokesGiven,
        });
      }

      // Determine hole winner (best ball format)
      const team1BestNet = Math.min(holeScores[0]?.netStrokes || 999, holeScores[1]?.netStrokes || 999);
      const team2BestNet = Math.min(holeScores[2]?.netStrokes || 999, holeScores[3]?.netStrokes || 999);

      let team1HolePoint = 0;
      let team2HolePoint = 0;

      if (team1BestNet < team2BestNet) {
        team1HolePoint = 1;
        team1TotalPoints += 1;
      } else if (team2BestNet < team1BestNet) {
        team2HolePoint = 1;
        team2TotalPoints += 1;
      } else {
        team1HolePoint = 0.5;
        team2HolePoint = 0.5;
        team1TotalPoints += 0.5;
        team2TotalPoints += 0.5;
      }

      // Insert hole scores
      for (let i = 0; i < holeScores.length; i++) {
        const hs = holeScores[i];
        const isTeam1 = i < 2;
        const pointsEarned = isTeam1
          ? (hs.netStrokes === team1BestNet ? team1HolePoint : 0)
          : (hs.netStrokes === team2BestNet ? team2HolePoint : 0);

        const { error: holeScoreError } = await supabase.from('hole_scores').insert({
          scorecard_id: hs.scorecard.id,
          hole_id: hole.id,
          strokes: hs.strokes,
          points_earned: pointsEarned,
        });

        if (holeScoreError) {
          console.error(`❌ Error inserting hole score for hole ${hole.hole_number}:`, holeScoreError);
        }
      }
    }

    // Update scorecards with totals
    for (let i = 0; i < scorecards.length; i++) {
      const sc = scorecards[i];

      // Get all hole scores for this scorecard
      const { data: holeScoresData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('scorecard_id', sc.id);

      const totalScore = holeScoresData?.reduce((sum: number, hs: any) => sum + hs.strokes, 0) || 0;
      const pointsEarned = holeScoresData?.reduce((sum: number, hs: any) => sum + hs.points_earned, 0) || 0;

      await supabase
        .from('scorecards')
        .update({
          total_score: totalScore,
          points_earned: pointsEarned,
        })
        .eq('id', sc.id);

      console.log(`   ${sc.player.name}: ${totalScore} (Points: ${pointsEarned})`);
    }

    // Update match with final scores and mark as completed
    await supabase
      .from('matches')
      .update({
        team1_points: team1TotalPoints,
        team2_points: team2TotalPoints,
        status: 'completed',
      })
      .eq('id', match.id);

    const winner = team1TotalPoints > team2TotalPoints ? team1.name : team2TotalPoints > team1TotalPoints ? team2.name : 'Tie';
    console.log(`   Final: ${team1.name} ${team1TotalPoints} - ${team2TotalPoints} ${team2.name}`);
    console.log(`   Winner: ${winner}\n`);
  }

  console.log(`✨ Match seeding complete!\n`);
}

// Run the seed function
const matchCount = parseInt(process.argv[2] || '3');
seedMatches(matchCount)
  .then(() => {
    console.log('✅ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
