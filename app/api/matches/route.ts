import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const {
      team1_id,
      team2_id,
      course_id,
      match_date,
      league_id = null,
      holes_to_play = 18,
      nine_selection = null,
      tee_selection = 'Blue'
    } = body;

    // Validate input
    if (!team1_id || !team2_id || !course_id || !match_date) {
      return NextResponse.json(
        { error: 'team1_id, team2_id, course_id, and match_date are required' },
        { status: 400 }
      );
    }

    // Validate holes_to_play
    if (![9, 18].includes(holes_to_play)) {
      return NextResponse.json(
        { error: 'holes_to_play must be 9 or 18' },
        { status: 400 }
      );
    }

    // Validate nine_selection if 9 holes
    if (holes_to_play === 9 && !['front', 'back'].includes(nine_selection)) {
      return NextResponse.json(
        { error: 'nine_selection must be "front" or "back" when playing 9 holes' },
        { status: 400 }
      );
    }

    // Validate tee_selection
    if (!['Black', 'Gold', 'Blue', 'White', 'Red'].includes(tee_selection)) {
      return NextResponse.json(
        { error: 'tee_selection must be one of: Black, Gold, Blue, White, Red' },
        { status: 400 }
      );
    }

    if (team1_id === team2_id) {
      return NextResponse.json(
        { error: 'Teams must be different' },
        { status: 400 }
      );
    }

    // Verify teams exist and are active
    const { data: team1 } = await supabaseAdmin
      .from('teams')
      .select('id, is_active')
      .eq('id', team1_id)
      .single();

    const { data: team2 } = await supabaseAdmin
      .from('teams')
      .select('id, is_active')
      .eq('id', team2_id)
      .single();

    if (!team1 || !team2) {
      return NextResponse.json(
        { error: 'One or both teams not found' },
        { status: 404 }
      );
    }

    if (!team1.is_active || !team2.is_active) {
      return NextResponse.json(
        { error: 'Both teams must be active' },
        { status: 400 }
      );
    }

    // Verify course exists
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', course_id)
      .single();

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create match
    const { data: match, error } = await supabaseAdmin
      .from('matches')
      .insert({
        team1_id,
        team2_id,
        course_id,
        match_date,
        league_id,
        holes_to_play,
        nine_selection: holes_to_play === 9 ? nine_selection : null,
        tee_selection,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return NextResponse.json(
        { error: 'Failed to create match' },
        { status: 500 }
      );
    }

    return NextResponse.json(match, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/matches:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: matches, error } = await supabaseAdmin
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error in GET /api/matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
