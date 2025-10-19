import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params;

    // Fetch members in this league
    const { data: members, error } = await supabaseAdmin
      .from('league_members')
      .select(`
        id,
        user_id,
        role,
        created_at,
        user:profiles(
          id,
          name,
          display_name,
          email
        )
      `)
      .eq('league_id', leagueId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching league members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch league members' },
        { status: 500 }
      );
    }

    return NextResponse.json(members || []);
  } catch (error: any) {
    console.error('Error in GET /api/leagues/[id]/members:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { email, role = 'viewer' } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['league_admin', 'team_captain', 'player', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user has league_admin role for this league
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'league_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only league admins can add members' },
        { status: 403 }
      );
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found. They must have logged in at least once.' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from('league_members')
      .select('id')
      .eq('league_id', leagueId)
      .eq('user_id', profile.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this league' },
        { status: 400 }
      );
    }

    // Add user to league
    const { data: newMember, error: insertError } = await supabaseAdmin
      .from('league_members')
      .insert({
        league_id: leagueId,
        user_id: profile.id,
        role,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding member to league:', insertError);
      return NextResponse.json(
        { error: 'Failed to add member to league' },
        { status: 500 }
      );
    }

    return NextResponse.json(newMember, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/leagues/[id]/members:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
