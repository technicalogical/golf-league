import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { calculateTeamMatch, PlayerScore, HoleData } from '@/lib/scoring';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: matchId } = await params;
    const { scores: inputScores, partial = false, recalculate = false } = await request.json();

    let scores = inputScores;

    // Get match with course and holes
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        course:courses(
          *,
          holes(*)
        )
      `)
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check authorization: user must be a team member of one of the teams OR a league admin
    const { data: team1Members } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('team_id', match.team1_id);

    const { data: team2Members } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('team_id', match.team2_id);

    const team1MemberIds = team1Members?.map(tm => tm.user_id) || [];
    const team2MemberIds = team2Members?.map(tm => tm.user_id) || [];
    const allTeamMemberIds = [...team1MemberIds, ...team2MemberIds];

    const isTeamMember = allTeamMemberIds.includes(userId);

    // Check if user is a league admin (if match has a league)
    let isLeagueAdmin = false;
    if (match.league_id) {
      const { data: membership } = await supabaseAdmin
        .from('league_members')
        .select('role')
        .eq('league_id', match.league_id)
        .eq('user_id', userId)
        .single();

      isLeagueAdmin = membership?.role === 'league_admin';
    }

    if (!isTeamMember && !isLeagueAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only team members and league admins can enter scores' },
        { status: 403 }
      );
    }

    // Get players from both teams
    const { data: team1Players } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('team_id', match.team1_id)
      .eq('is_active', true)
      .order('handicap');

    const { data: team2Players } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('team_id', match.team2_id)
      .eq('is_active', true)
      .order('handicap');

    if (!team1Players || team1Players.length !== 2 || !team2Players || team2Players.length !== 2) {
      return NextResponse.json(
        { error: 'Both teams must have exactly 2 active players' },
        { status: 400 }
      );
    }

    const allPlayers = [...team1Players, ...team2Players];

    // If recalculate flag is set, load existing scores from database
    if (recalculate && (!scores || scores.length === 0)) {
      // First get scorecards for this match
      const { data: matchScorecards } = await supabaseAdmin
        .from('scorecards')
        .select('id, player_id')
        .eq('match_id', matchId);

      if (matchScorecards && matchScorecards.length > 0) {
        const scorecardIds = matchScorecards.map(sc => sc.id);

        // Then get all hole scores for these scorecards
        const { data: existingHoleScores } = await supabaseAdmin
          .from('hole_scores')
          .select('hole_id, strokes, scorecard_id')
          .in('scorecard_id', scorecardIds);

        if (existingHoleScores && existingHoleScores.length > 0) {
          // Map scorecard_id to player_id
          const scorecardMap = new Map(matchScorecards.map(sc => [sc.id, sc.player_id]));

          scores = existingHoleScores.map((hs: any) => ({
            player_id: scorecardMap.get(hs.scorecard_id),
            hole_id: hs.hole_id,
            strokes: hs.strokes,
          })).filter((s: any) => s.player_id); // Filter out any null player_ids
        }
      }
    }

    // Organize scores by player
    const scoresByPlayer: Record<string, any[]> = {};
    scores.forEach((score: any) => {
      if (!scoresByPlayer[score.player_id]) {
        scoresByPlayer[score.player_id] = [];
      }
      if (typeof score.strokes === 'number') {
        scoresByPlayer[score.player_id].push({
          hole_id: score.hole_id,
          strokes: score.strokes,
        });
      }
    });

    // Build PlayerScore objects for scoring engine
    const playerScores: PlayerScore[] = allPlayers.map((player) => ({
      player_id: player.id,
      handicap: player.handicap,
      hole_scores: scoresByPlayer[player.id] || [],
    }));

    // Split into teams (lowest handicap vs lowest, highest vs highest)
    const team1ScorePlayers = playerScores.slice(0, 2) as [PlayerScore, PlayerScore];
    const team2ScorePlayers = playerScores.slice(2, 4) as [PlayerScore, PlayerScore];

    // Get holes data and filter based on match format
    let allHoles = (match.course?.holes || []).sort((a: any, b: any) => a.hole_number - b.hole_number);

    // Filter holes based on match format
    if (match.holes_to_play === 9) {
      if (match.nine_selection === 'front') {
        allHoles = allHoles.filter((h: any) => h.hole_number >= 1 && h.hole_number <= 9);
      } else {
        allHoles = allHoles.filter((h: any) => h.hole_number >= 10 && h.hole_number <= 18);
      }
    }

    const holes: HoleData[] = allHoles.map((h: any) => ({
      id: h.id,
      hole_number: h.hole_number,
      par: h.par,
      handicap_index: h.handicap_index,
    }));

    // Only calculate match results if we have complete scores
    let matchResult = null;
    if (!partial) {
      // Check if all players have all scores before calculating
      const allScoresComplete = playerScores.every(ps => ps.hole_scores.length === holes.length);
      if (allScoresComplete) {
        matchResult = calculateTeamMatch(team1ScorePlayers, team2ScorePlayers, holes);
      }
    }

    // Create or update scorecards for each player
    const scorecardIds: Record<string, string> = {};

    for (let i = 0; i < allPlayers.length; i++) {
      const player = allPlayers[i];
      const playerScore = playerScores[i];
      const totalScore = playerScore.hole_scores.reduce((sum, hs) => sum + hs.strokes, 0);

      // Find player's matchup and points (only if we calculated results)
      let pointsEarned = 0;
      if (matchResult) {
        matchResult.matchups.forEach((matchup) => {
          if (matchup.player1_id === player.id) {
            pointsEarned = matchup.player1_points;
          } else if (matchup.player2_id === player.id) {
            pointsEarned = matchup.player2_points;
          }
        });
      }

      // Check if scorecard already exists
      const { data: existingScorecard } = await supabaseAdmin
        .from('scorecards')
        .select('id')
        .eq('match_id', matchId)
        .eq('player_id', player.id)
        .single();

      if (existingScorecard) {
        // Update existing scorecard
        await supabaseAdmin
          .from('scorecards')
          .update({
            total_score: totalScore,
            points_earned: pointsEarned,
            handicap_at_time: player.handicap,
          })
          .eq('id', existingScorecard.id);

        scorecardIds[player.id] = existingScorecard.id;
      } else {
        // Create new scorecard
        const { data: newScorecard } = await supabaseAdmin
          .from('scorecards')
          .insert({
            match_id: matchId,
            player_id: player.id,
            total_score: totalScore,
            points_earned: pointsEarned,
            handicap_at_time: player.handicap,
          })
          .select('id')
          .single();

        if (newScorecard) {
          scorecardIds[player.id] = newScorecard.id;
        }
      }
    }

    // Save hole scores
    for (const score of scores) {
      if (typeof score.strokes !== 'number') continue;

      const scorecardId = scorecardIds[score.player_id];
      if (!scorecardId) continue;

      // Find points for this hole (only if we have match results)
      let pointsEarned = 0;
      if (matchResult) {
        matchResult.matchups.forEach((matchup) => {
          const holeResult = matchup.hole_results.find((hr) => hr.hole_id === score.hole_id);
          if (holeResult) {
            if (holeResult.winner === score.player_id) {
              pointsEarned = 1;
            } else if (holeResult.winner === 'tie') {
              pointsEarned = 0.5;
            }
          }
        });
      }

      // Upsert hole score
      await supabaseAdmin.from('hole_scores').upsert(
        {
          scorecard_id: scorecardId,
          hole_id: score.hole_id,
          strokes: score.strokes,
          points_earned: pointsEarned,
        },
        {
          onConflict: 'scorecard_id,hole_id',
        }
      );
    }

    // Update match with scores (only mark as completed if not partial)
    const updateData: any = {};

    if (matchResult) {
      updateData.team1_points = matchResult.team1_total_points;
      updateData.team2_points = matchResult.team2_total_points;
    }

    if (!partial) {
      updateData.status = 'completed';
    }

    // Only update match if we have data to update
    if (Object.keys(updateData).length > 0) {
      await supabaseAdmin
        .from('matches')
        .update(updateData)
        .eq('id', matchId);
    }

    return NextResponse.json({
      success: true,
      message: partial ? 'Scores saved successfully' : 'Match completed successfully',
      results: matchResult,
    });
  } catch (error: any) {
    console.error('Error saving scores:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save scores' },
      { status: 500 }
    );
  }
}
