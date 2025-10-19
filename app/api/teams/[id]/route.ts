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
    const { name, is_active } = body;

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Invalid team name' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (is_active !== undefined) updates.is_active = is_active;
    updates.updated_at = new Date().toISOString();

    // Update team
    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      );
    }

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('Error in PATCH /api/teams/[id]:', error);
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

    // Check if team has players
    const { data: players } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('team_id', id);

    if (players && players.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete team with players. Remove players first.' },
        { status: 400 }
      );
    }

    // Delete team
    const { error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team:', error);
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/teams/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
