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
      .select('id, team_id, team:teams(id, name)')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get all matches for this player's team
    const { data: matches } = await supabaseAdmin
      .from('matches')
      .select(`
        id,
        team1_id,
        team2_id,
        team1_points,
        team2_points,
        status
      `)
      .or(`team1_id.eq.${player.team_id},team2_id.eq.${player.team_id}`)
      .eq('status', 'completed');

    if (!matches || matches.length === 0) {
      return NextResponse.json([]);
    }

    // Get all opponent team IDs
    const opponentTeamIds = new Set<string>();
    matches.forEach((match: any) => {
      const opponentId = match.team1_id === player.team_id ? match.team2_id : match.team1_id;
      opponentTeamIds.add(opponentId);
    });

    // Get opponent team names
    const { data: opponentTeams } = await supabaseAdmin
      .from('teams')
      .select('id, name')
      .in('id', Array.from(opponentTeamIds));

    const teamMap = new Map(opponentTeams?.map((t: any) => [t.id, t.name]) || []);

    // Calculate head-to-head records
    const h2hRecords = new Map<string, { wins: number; losses: number; ties: number }>();

    matches.forEach((match: any) => {
      const isTeam1 = match.team1_id === player.team_id;
      const opponentId = isTeam1 ? match.team2_id : match.team1_id;
      const teamPoints = isTeam1 ? match.team1_points : match.team2_points;
      const opponentPoints = isTeam1 ? match.team2_points : match.team1_points;

      if (!h2hRecords.has(opponentId)) {
        h2hRecords.set(opponentId, { wins: 0, losses: 0, ties: 0 });
      }

      const record = h2hRecords.get(opponentId)!;
      if (teamPoints > opponentPoints) {
        record.wins++;
      } else if (teamPoints < opponentPoints) {
        record.losses++;
      } else {
        record.ties++;
      }
    });

    // Format results
    const results = Array.from(h2hRecords.entries()).map(([opponentId, record]) => ({
      opponent_name: teamMap.get(opponentId) || 'Unknown',
      matches_played: record.wins + record.losses + record.ties,
      wins: record.wins,
      losses: record.losses,
      ties: record.ties,
    }));

    // Sort by most matches played
    results.sort((a, b) => b.matches_played - a.matches_played);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching head-to-head records:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
