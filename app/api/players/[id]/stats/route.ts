import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params;

    // Get player info
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select(`
        id,
        name,
        handicap,
        team:teams(id, name)
      `)
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get all scorecards for this player
    const { data: scorecards, error: scorecardsError } = await supabaseAdmin
      .from('scorecards')
      .select(`
        *,
        match:matches(
          id,
          match_date,
          status,
          team1_id,
          team2_id,
          team1_points,
          team2_points
        )
      `)
      .eq('player_id', playerId);

    console.log('Scorecards query result:', {
      scorecardsCount: scorecards?.length,
      scorecardsError,
      playerId,
      sampleScorecard: scorecards?.[0]
    });

    // Filter for completed matches with valid scores
    const completedScorecards = (scorecards || []).filter(
      (sc: any) =>
        sc.match?.status === 'completed' &&
        sc.total_score &&
        sc.total_score > 0
    );

    console.log('Completed scorecards:', {
      count: completedScorecards.length,
      sample: completedScorecards[0]
    });

    // Calculate stats
    const total_matches = completedScorecards.length;
    const total_points = completedScorecards.reduce(
      (sum: number, sc: any) => sum + (sc.points_earned || 0),
      0
    );

    let wins = 0;
    let losses = 0;
    let ties = 0;

    completedScorecards.forEach((sc: any) => {
      const match = sc.match;
      const playerTeamId = player.team.id;
      const isTeam1 = match.team1_id === playerTeamId;
      const teamPoints = isTeam1 ? match.team1_points : match.team2_points;
      const opponentPoints = isTeam1 ? match.team2_points : match.team1_points;

      if (teamPoints > opponentPoints) wins++;
      else if (teamPoints < opponentPoints) losses++;
      else ties++;
    });

    const scores = completedScorecards.map((sc: any) => sc.total_score);
    const avg_score = scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;
    const best_score = scores.length > 0 ? Math.min(...scores) : null;
    const worst_score = scores.length > 0 ? Math.max(...scores) : null;

    // Prepare trends data (last 10 matches, sorted by date)
    const sortedScorecards = [...completedScorecards].sort(
      (a, b) => new Date(a.match.match_date).getTime() - new Date(b.match.match_date).getTime()
    );
    const trends = sortedScorecards.slice(-10).map((sc: any) => ({
      date: sc.match.match_date,
      score: sc.total_score,
      points: sc.points_earned || 0,
    }));

    // Prepare recent matches data
    const recent_matches = await Promise.all(
      completedScorecards.slice(0, 10).map(async (sc: any) => {
        const match = sc.match;
        const playerTeamId = player.team.id;
        const isTeam1 = match.team1_id === playerTeamId;
        const opponentTeamId = isTeam1 ? match.team2_id : match.team1_id;

        // Get opponent team name
        const { data: opponentTeam } = await supabaseAdmin
          .from('teams')
          .select('name')
          .eq('id', opponentTeamId)
          .single();

        const teamPoints = isTeam1 ? match.team1_points : match.team2_points;
        const opponentPoints = isTeam1 ? match.team2_points : match.team1_points;

        let result: 'win' | 'loss' | 'tie' = 'tie';
        if (teamPoints > opponentPoints) result = 'win';
        else if (teamPoints < opponentPoints) result = 'loss';

        return {
          id: match.id,
          date: match.match_date,
          opponent: opponentTeam?.name || 'Unknown',
          score: sc.total_score,
          points: sc.points_earned || 0,
          result,
        };
      })
    );

    return NextResponse.json({
      player,
      stats: {
        total_matches,
        total_points,
        wins,
        losses,
        ties,
        avg_score,
        best_score,
        worst_score,
      },
      trends,
      recent_matches,
    });
  } catch (error: any) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
