import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; weekNumber: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leagueId, weekNumber } = await params;
    const body = await request.json();
    const {
      match_ids,
      course_id,
      holes_to_play = 18,
      nine_selection = null,
      tee_selection = 'Blue',
      stimp_setting = 9.0,
      pin_placement = 'Intermediate',
    } = body;

    // Validate input
    if (!match_ids || !Array.isArray(match_ids) || match_ids.length === 0) {
      return NextResponse.json(
        { error: 'match_ids array is required' },
        { status: 400 }
      );
    }

    if (!course_id) {
      return NextResponse.json(
        { error: 'course_id is required' },
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
        { error: 'Forbidden: Only league admins can update week settings' },
        { status: 403 }
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

    // Validate stimp_setting
    const stimpValue = parseFloat(stimp_setting.toString());
    if (isNaN(stimpValue) || stimpValue < 1 || stimpValue > 12) {
      return NextResponse.json(
        { error: 'stimp_setting must be between 1.0 and 12.0' },
        { status: 400 }
      );
    }

    // Validate pin_placement
    if (!['Novice', 'Intermediate', 'Advanced'].includes(pin_placement)) {
      return NextResponse.json(
        { error: 'pin_placement must be one of: Novice, Intermediate, Advanced' },
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

    // Update all matches for this week
    const { data: updatedMatches, error: updateError } = await supabaseAdmin
      .from('matches')
      .update({
        course_id,
        holes_to_play,
        nine_selection: holes_to_play === 9 ? nine_selection : null,
        tee_selection,
        stimp_setting: stimpValue,
        pin_placement,
      })
      .in('id', match_ids)
      .select();

    if (updateError) {
      console.error('Error updating matches:', updateError);
      return NextResponse.json(
        { error: 'Failed to update matches' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully updated ${updatedMatches.length} match(es) for week ${weekNumber}`,
      matches: updatedMatches,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/leagues/[id]/weeks/[weekNumber]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
