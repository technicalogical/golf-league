import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { name, handicap, is_active } = body;

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Invalid player name' },
        { status: 400 }
      );
    }

    if (handicap !== undefined && (typeof handicap !== 'number' || handicap < 0 || handicap > 54)) {
      return NextResponse.json(
        { error: 'Handicap must be between 0 and 54' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (handicap !== undefined) updates.handicap = handicap;
    if (is_active !== undefined) updates.is_active = is_active;
    updates.updated_at = new Date().toISOString();

    // Update player
    const { data: player, error } = await supabaseAdmin
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating player:', error);
      return NextResponse.json(
        { error: 'Failed to update player' },
        { status: 500 }
      );
    }

    return NextResponse.json(player);
  } catch (error: any) {
    console.error('Error in PATCH /api/players/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    // Check if player has scorecards
    const { data: scorecards } = await supabaseAdmin
      .from('scorecards')
      .select('id')
      .eq('player_id', id)
      .limit(1);

    if (scorecards && scorecards.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete player with existing scorecards. Set to inactive instead.' },
        { status: 400 }
      );
    }

    // Delete player
    const { error } = await supabaseAdmin
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting player:', error);
      return NextResponse.json(
        { error: 'Failed to delete player' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/players/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
