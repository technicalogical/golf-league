import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: teamId } = await params;

    // Check if user is captain
    const { data: team } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.captain_id !== userId) {
      return NextResponse.json(
        { error: 'Only team captain can access settings' },
        { status: 403 }
      );
    }

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('Error in GET /api/teams/[id]/settings:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: teamId } = await params;

    // Check if user is captain
    const { data: team } = await supabaseAdmin
      .from('teams')
      .select('captain_id')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.captain_id !== userId) {
      return NextResponse.json(
        { error: 'Only team captain can update settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { open_to_join } = body;

    // Update team settings
    const { data: updatedTeam, error } = await supabaseAdmin
      .from('teams')
      .update({ open_to_join })
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      console.error('Error updating team settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedTeam);
  } catch (error: any) {
    console.error('Error in PATCH /api/teams/[id]/settings:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
