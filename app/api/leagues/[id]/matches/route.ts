import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params;

    // Fetch all matches for this league
    const { data: matches, error } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name),
        team2:teams!matches_team2_id_fkey(id, name),
        course:courses(id, name, par, location)
      `)
      .eq('league_id', leagueId)
      .order('week_number', { ascending: true })
      .order('match_date', { ascending: true });

    if (error) {
      console.error('Error fetching league matches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch league matches' },
        { status: 500 }
      );
    }

    return NextResponse.json(matches || []);
  } catch (error: any) {
    console.error('Error in GET /api/leagues/[id]/matches:', error);
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

    // Check if user has league_admin role for this league
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'league_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only league admins can create matches' },
        { status: 403 }
      );
    }

    // Validate required fields
    const {
      team1_id,
      team2_id,
      match_date,
      course_id,
      holes_to_play,
      nine_selection,
      tee_selection,
      pin_position,
      stimp_rating,
      week_number,
      status = 'scheduled',
    } = body;

    if (!team1_id || !team2_id || !match_date || !course_id) {
      return NextResponse.json(
        { error: 'Missing required fields: team1_id, team2_id, match_date, course_id' },
        { status: 400 }
      );
    }

    if (team1_id === team2_id) {
      return NextResponse.json(
        { error: 'Teams must be different' },
        { status: 400 }
      );
    }

    // Create the match (map frontend field names to database column names)
    const { data: match, error: insertError } = await supabaseAdmin
      .from('matches')
      .insert({
        league_id: leagueId,
        team1_id,
        team2_id,
        match_date,
        course_id,
        holes_to_play: holes_to_play || 18,
        nine_selection: holes_to_play === 9 ? nine_selection : null,
        tee_selection: tee_selection || 'Blue',
        pin_placement: pin_position || 'Intermediate', // Database uses pin_placement
        stimp_setting: stimp_rating ? parseFloat(stimp_rating) : 10, // Database uses stimp_setting (numeric)
        week_number: week_number || null,
        status,
      })
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name),
        team2:teams!matches_team2_id_fkey(id, name),
        course:courses(id, name, par, location)
      `)
      .single();

    if (insertError) {
      console.error('Error creating match:', insertError);
      return NextResponse.json(
        { error: 'Failed to create match' },
        { status: 500 }
      );
    }

    return NextResponse.json(match, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/leagues/[id]/matches:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
