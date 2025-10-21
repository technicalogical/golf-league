import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('league_id');

    // Get team standings
    let teamsQuery = supabaseAdmin.from('teams').select('id, name');

    // If filtering by league, only get teams in that league
    if (leagueId && leagueId !== 'all') {
      const { data: leagueTeams } = await supabaseAdmin
        .from('league_teams')
        .select('team_id')
        .eq('league_id', leagueId);

      const teamIds = (leagueTeams || []).map(lt => lt.team_id);
      if (teamIds.length === 0) {
        return NextResponse.json({ teams: [], players: [] });
      }
      teamsQuery = teamsQuery.in('id', teamIds);
    }

    const { data: teams, error: teamsError } = await teamsQuery;
    if (teamsError) throw teamsError;

    // Calculate team stats
    const teamStandings = await Promise.all(
      (teams || []).map(async (team) => {
        // Get all matches for this team
        let matchesQuery = supabaseAdmin
          .from('matches')
          .select('id, team1_id, team2_id, team1_points, team2_points, status, league_id')
          .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`)
          .eq('status', 'completed');

        // Filter by league if specified
        if (leagueId && leagueId !== 'all') {
          matchesQuery = matchesQuery.eq('league_id', leagueId);
        }

        const { data: matches } = await matchesQuery;

        let totalPoints = 0;
        let wins = 0;
        let losses = 0;
        let ties = 0;

        (matches || []).forEach((match) => {
          const isTeam1 = match.team1_id === team.id;
          const teamPoints = isTeam1 ? match.team1_points : match.team2_points;
          const opponentPoints = isTeam1 ? match.team2_points : match.team1_points;

          totalPoints += teamPoints || 0;

          if (teamPoints > opponentPoints) wins++;
          else if (teamPoints < opponentPoints) losses++;
          else ties++;
        });

        return {
          team_id: team.id,
          team_name: team.name,
          matches_played: (matches || []).length,
          total_points: totalPoints,
          wins,
          losses,
          ties,
        };
      })
    );

    // Sort by total points
    teamStandings.sort((a, b) => b.total_points - a.total_points);

    // Get player standings
    let playersQuery = supabaseAdmin
      .from('players')
      .select(`
        id,
        name,
        team_id,
        handicap,
        team:teams(name)
      `);

    // If filtering by league, only get players on teams in that league
    if (leagueId && leagueId !== 'all') {
      const { data: leagueTeams } = await supabaseAdmin
        .from('league_teams')
        .select('team_id')
        .eq('league_id', leagueId);

      const teamIds = (leagueTeams || []).map(lt => lt.team_id);
      if (teamIds.length > 0) {
        playersQuery = playersQuery.in('team_id', teamIds);
      }
    }

    const { data: players, error: playersError } = await playersQuery;
    if (playersError) throw playersError;

    const playerStandings = await Promise.all(
      (players || []).map(async (player: any) => {
        // Build scorecards query
        let scorecardsQuery = supabaseAdmin
          .from('scorecards')
          .select(`
            total_score,
            points_earned,
            match:matches!inner(status, league_id)
          `)
          .eq('player_id', player.id)
          .eq('match.status', 'completed');

        // Filter by league if specified
        if (leagueId && leagueId !== 'all') {
          scorecardsQuery = scorecardsQuery.eq('match.league_id', leagueId);
        }

        const { data: scorecards } = await scorecardsQuery;

        const completedScores = (scorecards || []).filter(
          (sc: any) => sc.total_score !== null && sc.total_score > 0
        );

        const totalPoints = completedScores.reduce(
          (sum: number, sc: any) => sum + (sc.points_earned || 0),
          0
        );

        const avgScore =
          completedScores.length > 0
            ? completedScores.reduce(
                (sum: number, sc: any) => sum + sc.total_score,
                0
              ) / completedScores.length
            : 0;

        const bestScore =
          completedScores.length > 0
            ? Math.min(...completedScores.map((sc: any) => sc.total_score))
            : null;

        return {
          player_id: player.id,
          player_name: player.name,
          team_name: player.team?.name || 'No Team',
          handicap: player.handicap,
          matches_played: completedScores.length,
          total_points: totalPoints,
          avg_score: avgScore,
          best_score: bestScore,
        };
      })
    );

    // Sort by total points
    playerStandings.sort((a, b) => b.total_points - a.total_points);

    return NextResponse.json({
      teams: teamStandings,
      players: playerStandings,
    });
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
