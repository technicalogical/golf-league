import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { team_id, name, handicap, is_active = true } = body;

    // Validate input
    if (!team_id || !name || handicap === undefined) {
      return NextResponse.json(
        { error: 'team_id, name, and handicap are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid player name' },
        { status: 400 }
      );
    }

    if (typeof handicap !== 'number' || handicap < 0 || handicap > 54) {
      return NextResponse.json(
        { error: 'Handicap must be between 0 and 54' },
        { status: 400 }
      );
    }

    // Check if team exists
    const { data: team } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('id', team_id)
      .single();

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if team already has 2 players
    const { data: existingPlayers } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('team_id', team_id);

    if (existingPlayers && existingPlayers.length >= 2) {
      return NextResponse.json(
        { error: 'Team already has 2 players. Remove a player before adding another.' },
        { status: 400 }
      );
    }

    // Create player
    const { data: player, error } = await supabaseAdmin
      .from('players')
      .insert({
        team_id,
        name: name.trim(),
        handicap,
        is_active,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      return NextResponse.json(
        { error: 'Failed to create player' },
        { status: 500 }
      );
    }

    return NextResponse.json(player, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/players:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
