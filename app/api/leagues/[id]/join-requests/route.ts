import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

// POST - Create a join request
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

    const { id: leagueId } = await params;
    const body = await request.json();
    const { team_id, message } = body;

    if (!team_id) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Verify user is captain of the team
    const { data: team } = await supabaseAdmin
      .from('teams')
      .select('captain_id, name')
      .eq('id', team_id)
      .single();

    if (!team || team.captain_id !== userId) {
      return NextResponse.json(
        { error: 'You must be the team captain to request to join' },
        { status: 403 }
      );
    }

    // Check if team is already in the league
    const { data: existing } = await supabaseAdmin
      .from('league_teams')
      .select('id')
      .eq('league_id', leagueId)
      .eq('team_id', team_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Your team is already in this league' },
        { status: 400 }
      );
    }

    // Check if there's already a pending request
    const { data: pendingRequest } = await supabaseAdmin
      .from('league_join_requests')
      .select('id, status')
      .eq('league_id', leagueId)
      .eq('team_id', team_id)
      .single();

    if (pendingRequest) {
      if (pendingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending request for this league' },
          { status: 400 }
        );
      }
      // Delete old approved/rejected request so they can reapply
      await supabaseAdmin
        .from('league_join_requests')
        .delete()
        .eq('id', pendingRequest.id);
    }

    // Create join request
    const { data: joinRequest, error } = await supabaseAdmin
      .from('league_join_requests')
      .insert({
        league_id: leagueId,
        team_id,
        requested_by: userId,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating join request:', error);
      return NextResponse.json(
        { error: 'Failed to create join request' },
        { status: 500 }
      );
    }

    return NextResponse.json(joinRequest, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/leagues/[id]/join-requests:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get join requests for a league (admin only)
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

    const { id: leagueId } = await params;

    // Check if user is league admin or site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    const isSiteAdmin = profile?.is_site_admin || false;

    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    const isLeagueAdmin = membership?.role === 'league_admin';

    if (!isLeagueAdmin && !isSiteAdmin) {
      return NextResponse.json(
        { error: 'Only league admins can view join requests' },
        { status: 403 }
      );
    }

    // Fetch join requests
    const { data: requests, error } = await supabaseAdmin
      .from('league_join_requests')
      .select(`
        *,
        team:teams(id, name, max_members),
        requester:profiles!league_join_requests_requested_by_fkey(
          id,
          name,
          display_name,
          email
        )
      `)
      .eq('league_id', leagueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching join requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch join requests' },
        { status: 500 }
      );
    }

    return NextResponse.json(requests || []);
  } catch (error: any) {
    console.error('Error in GET /api/leagues/[id]/join-requests:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
