import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
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

// Generate realistic golf scores based on par and handicap
function generateScore(par: number, handicap: number): number {
  const skillFactor = Math.max(0, Math.min(1, (36 - handicap) / 36)); // 0 to 1, better with lower handicap
  const baseScore = par;

  // Random variation: better players have tighter variance
  const variance = 2 - skillFactor; // 1 to 2
  const randomFactor = (Math.random() - 0.5) * variance;

  // Handicap effect
  const handicapEffect = (handicap / 18) * (par > 3 ? 1 : 0); // More effect on par 4/5

  const score = Math.round(baseScore + randomFactor + handicapEffect * 0.3);
  return Math.max(par - 1, Math.min(par + 3, score)); // Keep within reasonable range
}

// Determine hole winner based on net scores
function getHoleWinner(
  team1NetScore: number,
  team2NetScore: number
): 'team1' | 'team2' | 'tie' {
  if (team1NetScore < team2NetScore) return 'team1';
  if (team2NetScore < team1NetScore) return 'team2';
  return 'tie';
}

// Calculate strokes for a player on a hole based on handicap
function getStrokesForHole(handicap: number, holeHandicap: number): number {
  if (handicap <= 0) return 0;
  const fullStrokes = Math.floor(handicap / 18);
  const remainingStrokes = handicap % 18;
  return fullStrokes + (holeHandicap <= remainingStrokes ? 1 : 0);
}

async function completeMatches(leagueId?: string, limit?: number) {
  console.log('\n⛳ Completing scheduled matches with realistic scores...\n');

  // Get scheduled matches with full details
  let query = supabase
    .from('matches')
    .select(`
      *,
      course:courses(id, name, par),
      team1:teams!matches_team1_id_fkey(id, name),
      team2:teams!matches_team2_id_fkey(id, name)
    `)
    .eq('status', 'scheduled')
    .order('match_date', { ascending: true });

  // Filter by league if specified
  if (leagueId) {
    query = query.eq('league_id', leagueId);
  }

  if (limit) {
    query.limit(limit);
  }

  const { data: matches, error: matchesError } = await query;

  if (matchesError) {
    console.error('❌ Error fetching matches:', matchesError);
    return;
  }

  if (!matches || matches.length === 0) {
    console.log('✅ No scheduled matches found to complete.');
    return;
  }

  console.log(`📊 Found ${matches.length} scheduled matches to complete\n`);

  let completed = 0;
  let errors = 0;

  for (const match of matches) {
    console.log(`\n🏌️ Processing: ${match.team1?.name} vs ${match.team2?.name}`);

    try {
      // Get players for both teams
      const { data: team1Players } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', match.team1_id)
        .eq('is_active', true)
        .limit(2);

      const { data: team2Players } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', match.team2_id)
        .eq('is_active', true)
        .limit(2);

      if (!team1Players || team1Players.length < 2) {
        console.log(`⚠️  ${match.team1?.name} doesn't have 2 active players, skipping...`);
        continue;
      }

      if (!team2Players || team2Players.length < 2) {
        console.log(`⚠️  ${match.team2?.name} doesn't have 2 active players, skipping...`);
        continue;
      }

      // Get course holes
      const { data: holes } = await supabase
        .from('holes')
        .select('*')
        .eq('course_id', match.course_id)
        .order('hole_number', { ascending: true });

      if (!holes || holes.length === 0) {
        console.log(`⚠️  Course has no holes defined, skipping...`);
        continue;
      }

      // Filter holes based on match configuration
      let matchHoles = holes;
      if (match.holes_to_play === 9) {
        matchHoles = holes.filter(h =>
          match.nine_selection === 'front'
            ? h.hole_number <= 9
            : h.hole_number > 9
        );
      }

      // Create scorecards for all 4 players
      const allPlayers = [...team1Players, ...team2Players];
      const scorecardIds: string[] = [];

      for (const player of allPlayers) {
        const { data: scorecard, error: scorecardError } = await supabase
          .from('scorecards')
          .insert({
            match_id: match.id,
            player_id: player.id,
            handicap_at_time: player.handicap,
            total_score: 0, // Will calculate
            points_earned: 0, // Will calculate
          })
          .select()
          .single();

        if (scorecardError) {
          console.error(`❌ Error creating scorecard for ${player.name}:`, scorecardError.message);
          throw scorecardError;
        }

        scorecardIds.push(scorecard.id);

        // Generate hole scores
        let totalGross = 0;
        for (const hole of matchHoles) {
          const grossScore = generateScore(hole.par, player.handicap);
          totalGross += grossScore;

          // Calculate strokes for this hole (only on par 4/5)
          const strokes = hole.par > 3 ? getStrokesForHole(player.handicap, hole.handicap_index) : 0;
          const netScore = grossScore - strokes;

          await supabase.from('hole_scores').insert({
            scorecard_id: scorecard.id,
            hole_id: hole.id,
            gross_score: grossScore,
            net_score: netScore,
            strokes_given: strokes,
            putts: Math.floor(Math.random() * 2) + 1, // 1-2 putts
          });
        }

        // Update scorecard totals
        await supabase
          .from('scorecards')
          .update({
            total_score: totalGross,
          })
          .eq('id', scorecard.id);
      }

      // Calculate points hole by hole
      let team1Points = 0;
      let team2Points = 0;

      for (const hole of matchHoles) {
        // Get all 4 players' scores for this hole
        const { data: holeScores } = await supabase
          .from('hole_scores')
          .select(`
            *,
            scorecard:scorecards(player_id)
          `)
          .eq('hole_id', hole.id)
          .in('scorecard_id', scorecardIds);

        if (!holeScores || holeScores.length !== 4) continue;

        // Split into teams
        const team1Scores = holeScores.filter(hs =>
          team1Players.some(p => p.id === hs.scorecard.player_id)
        );
        const team2Scores = holeScores.filter(hs =>
          team2Players.some(p => p.id === hs.scorecard.player_id)
        );

        // Calculate team totals for this hole
        const team1NetTotal = team1Scores.reduce((sum, hs) => sum + hs.net_score, 0);
        const team2NetTotal = team2Scores.reduce((sum, hs) => sum + hs.net_score, 0);

        // Determine winner
        const winner = getHoleWinner(team1NetTotal, team2NetTotal);

        // Award points (1 point per hole)
        if (winner === 'team1') {
          team1Points += 1;
        } else if (winner === 'team2') {
          team2Points += 1;
        } else {
          team1Points += 0.5;
          team2Points += 0.5;
        }

        // Update hole scores with winner
        await supabase
          .from('hole_scores')
          .update({ hole_winner: winner })
          .in('id', holeScores.map(hs => hs.id));
      }

      // Award bonus point for lowest team total
      const { data: finalScorecards } = await supabase
        .from('scorecards')
        .select('*')
        .in('id', scorecardIds);

      if (finalScorecards) {
        const team1TotalNet = finalScorecards
          .filter(sc => team1Players.some(p => p.id === sc.player_id))
          .reduce((sum, sc) => sum + (sc.total_score || 0), 0);

        const team2TotalNet = finalScorecards
          .filter(sc => team2Players.some(p => p.id === sc.player_id))
          .reduce((sum, sc) => sum + (sc.total_score || 0), 0);

        if (team1TotalNet < team2TotalNet) {
          team1Points += 1;
        } else if (team2TotalNet < team1TotalNet) {
          team2Points += 1;
        } else {
          team1Points += 0.5;
          team2Points += 0.5;
        }
      }

      // Distribute points to players (evenly split)
      const team1PointsPerPlayer = team1Points / 2;
      const team2PointsPerPlayer = team2Points / 2;

      for (const player of team1Players) {
        await supabase
          .from('scorecards')
          .update({ points_earned: team1PointsPerPlayer })
          .eq('match_id', match.id)
          .eq('player_id', player.id);
      }

      for (const player of team2Players) {
        await supabase
          .from('scorecards')
          .update({ points_earned: team2PointsPerPlayer })
          .eq('match_id', match.id)
          .eq('player_id', player.id);
      }

      // Update match status and scores
      await supabase
        .from('matches')
        .update({
          status: 'completed',
          team1_score: team1Points,
          team2_score: team2Points,
        })
        .eq('id', match.id);

      console.log(`✅ Completed: ${match.team1?.name} ${team1Points} - ${team2Points} ${match.team2?.name}`);
      completed++;

    } catch (error: any) {
      console.error(`❌ Error completing match:`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Completed: ${completed}`);
  console.log(`   ❌ Errors: ${errors}\n`);
}

// Run the script
const leagueId = process.argv[2] || undefined;
const limit = process.argv[3] ? parseInt(process.argv[3]) : undefined;

if (!leagueId) {
  console.log('Usage: npm run complete:matches <league-id> [limit]');
  console.log('Example: npm run complete:matches ea19d8b0-4d72-4182-8c39-24e92766cb99');
  process.exit(1);
}

completeMatches(leagueId, limit)
  .then(() => {
    console.log('✨ Match completion script finished!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
