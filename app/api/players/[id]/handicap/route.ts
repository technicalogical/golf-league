import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: playerId } = await params;
    const { handicap } = await request.json();

    // Validate handicap
    if (typeof handicap !== 'number' || handicap < 0 || handicap > 54) {
      return NextResponse.json(
        { error: 'Invalid handicap. Must be between 0 and 54.' },
        { status: 400 }
      );
    }

    // Get player details including team
    const { data: player, error: playerError } = await supabaseAdmin
      .from('players')
      .select('id, team_id, teams(league_teams(league_id))')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get all leagues this player's team belongs to
    const leagueIds = (player.teams?.league_teams || []).map((lt: any) => lt.league_id);

    if (leagueIds.length === 0) {
      return NextResponse.json(
        { error: 'Player team is not in any league' },
        { status: 400 }
      );
    }

    // Check if user is a league admin for any of these leagues
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('league_id, role')
      .eq('user_id', userId)
      .in('league_id', leagueIds)
      .eq('role', 'league_admin');

    if (!membership || membership.length === 0) {
      return NextResponse.json(
        { error: 'Forbidden: Only league admins can update handicaps' },
        { status: 403 }
      );
    }

    // Update handicap
    const { data: updatedPlayer, error: updateError } = await supabaseAdmin
      .from('players')
      .update({ handicap })
      .eq('id', playerId)
      .select('id, name, handicap')
      .single();

    if (updateError) {
      console.error('Error updating handicap:', updateError);
      return NextResponse.json(
        { error: 'Failed to update handicap' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      player: updatedPlayer,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/players/[id]/handicap:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
