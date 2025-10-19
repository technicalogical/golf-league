import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invite_code } = body;

    if (!invite_code || typeof invite_code !== 'string') {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    // Find team by invite code
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id, name, max_members')
      .eq('invite_code', invite_code.trim().toUpperCase())
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this team' },
        { status: 400 }
      );
    }

    // Check if team is full
    const { count: memberCount } = await supabaseAdmin
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', team.id);

    if (memberCount !== null && memberCount >= team.max_members) {
      return NextResponse.json(
        { error: 'This team is full' },
        { status: 400 }
      );
    }

    // Add user to team
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        is_captain: false,
      });

    if (memberError) {
      console.error('Error adding team member:', memberError);
      return NextResponse.json(
        { error: 'Failed to join team' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      team_id: team.id,
      team_name: team.name,
      message: 'Successfully joined team!',
    });
  } catch (error: any) {
    console.error('Error in POST /api/teams/join:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
