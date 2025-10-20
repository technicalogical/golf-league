import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(
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

    // Get team details
    const { data: team, error: teamError } = await supabaseAdmin
      .from('teams')
      .select('id, name, max_members, open_to_join, is_active')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if team is open to join
    if (!team.open_to_join) {
      return NextResponse.json(
        { error: 'This team requires an invite code to join' },
        { status: 403 }
      );
    }

    // Check if team is active
    if (!team.is_active) {
      return NextResponse.json(
        { error: 'This team is not currently active' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
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
      .eq('team_id', teamId);

    if (memberCount !== null && memberCount >= team.max_members) {
      return NextResponse.json(
        { error: 'This team is full' },
        { status: 400 }
      );
    }

    // Get user's profile to get their name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single();

    const playerName = profile?.name || profile?.email || 'Unknown Player';

    // Add user to team
    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: 'member',
      });

    if (memberError) {
      console.error('Error adding team member:', memberError);
      return NextResponse.json(
        { error: 'Failed to join team' },
        { status: 500 }
      );
    }

    // Also create a player record for this user
    const { error: playerError } = await supabaseAdmin
      .from('players')
      .insert({
        name: playerName,
        team_id: teamId,
        user_id: userId,
        handicap: 0, // Default handicap, user can update later
        is_active: true,
      });

    if (playerError) {
      console.error('Error creating player record:', playerError);
      // Don't fail the request, just log the error
      // The team member was still added successfully
    }

    return NextResponse.json({
      team_id: teamId,
      team_name: team.name,
      message: 'Successfully joined team!',
    });
  } catch (error: any) {
    console.error('Error in POST /api/teams/[id]/join-open:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
