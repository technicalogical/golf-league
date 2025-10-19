import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, max_members = 2, open_to_join = false } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Create team with creator
    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .insert({
        name: name.trim(),
        is_active: true,
        max_members,
        open_to_join,
        captain_id: userId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      );
    }

    // Add creator as team member and captain
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        is_captain: true,
      });

    if (memberError) {
      console.error('Error adding team member:', memberError);
      // Rollback - delete the team
      await supabaseAdmin.from('teams').delete().eq('id', team.id);
      return NextResponse.json(
        { error: 'Failed to create team membership' },
        { status: 500 }
      );
    }

    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/teams:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching teams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    }

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error in GET /api/teams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
