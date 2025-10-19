import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

interface ScheduleMatch {
  team1_id: string;
  team2_id: string;
  week_number: number;
  course_id: string;
  date: string;
  holes_to_play: number;
  nine_selection?: string;
  tee_selection: string;
  pin_position?: string;
  stimp_rating?: string;
  is_playoff?: boolean;
  notes?: string;
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
    const { schedule } = body;

    // Validate input
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return NextResponse.json(
        { error: 'schedule array is required' },
        { status: 400 }
      );
    }

    // Validate that all matches have required fields
    const invalidMatches = schedule.some((match: ScheduleMatch) =>
      !match.course_id || !match.date || !match.holes_to_play || !match.tee_selection
    );
    if (invalidMatches) {
      return NextResponse.json(
        { error: 'All matches must have course_id, date, holes_to_play, and tee_selection' },
        { status: 400 }
      );
    }

    // Validate each match's settings
    for (const match of schedule) {
      if (![9, 18].includes(match.holes_to_play)) {
        return NextResponse.json(
          { error: 'holes_to_play must be 9 or 18' },
          { status: 400 }
        );
      }

      if (match.holes_to_play === 9 && !match.nine_selection) {
        return NextResponse.json(
          { error: 'nine_selection is required when playing 9 holes' },
          { status: 400 }
        );
      }

      if (!['Black', 'Gold', 'Blue', 'White', 'Red'].includes(match.tee_selection)) {
        return NextResponse.json(
          { error: 'tee_selection must be one of: Black, Gold, Blue, White, Red' },
          { status: 400 }
        );
      }
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
        { error: 'Forbidden: Only league admins can generate schedules' },
        { status: 403 }
      );
    }

    // Verify all courses exist
    const uniqueCourseIds = [...new Set(schedule.map((m: ScheduleMatch) => m.course_id))];
    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('id')
      .in('id', uniqueCourseIds);

    if (!courses || courses.length !== uniqueCourseIds.length) {
      return NextResponse.json(
        { error: 'One or more courses not found' },
        { status: 404 }
      );
    }

    // Build matches with provided dates and configurations
    const matches = schedule.map((match: ScheduleMatch) => {
      const pinPlacement = match.pin_position || 'Intermediate';
      console.log('Match pin_position:', match.pin_position, 'Using:', pinPlacement);

      return {
        league_id: leagueId,
        team1_id: match.team1_id,
        team2_id: match.team2_id,
        course_id: match.course_id,
        match_date: match.date,
        week_number: match.week_number,
        status: 'scheduled',
        holes_to_play: match.holes_to_play,
        nine_selection: match.holes_to_play === 9 ? match.nine_selection : null,
        tee_selection: match.tee_selection,
        pin_placement: pinPlacement,
        stimp_setting: match.stimp_rating ? parseFloat(match.stimp_rating) : 9.0,
      };
    });

    // Insert all matches
    const { data: createdMatches, error: insertError } = await supabaseAdmin
      .from('matches')
      .insert(matches)
      .select();

    if (insertError) {
      console.error('Error creating matches:', insertError);
      return NextResponse.json(
        { error: 'Failed to create matches' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Successfully created ${createdMatches.length} matches`,
        matches: createdMatches,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/leagues/[id]/schedule:', error);
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
        { error: 'Only league admins can destroy schedules' },
        { status: 403 }
      );
    }

    // Delete all matches for this league
    const { error } = await supabaseAdmin
      .from('matches')
      .delete()
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error destroying schedule:', error);
      return NextResponse.json(
        { error: 'Failed to destroy schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule destroyed successfully'
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/leagues/[id]/schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
