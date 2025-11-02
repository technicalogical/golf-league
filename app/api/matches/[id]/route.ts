import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch match with all details
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name),
        team2:teams!matches_team2_id_fkey(id, name),
        course:courses(
          id,
          name,
          par,
          holes(id, hole_number, par, handicap_index, yardage, yardage_black, yardage_gold, yardage_blue, yardage_white, yardage_red)
        )
      `)
      .eq('id', id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Fetch team 1 players
    const { data: team1Players } = await supabaseAdmin
      .from('players')
      .select('id, name, handicap, user_id, team_id')
      .eq('team_id', match.team1_id)
      .eq('is_active', true)
      .order('handicap');

    // Fetch team 2 players
    const { data: team2Players } = await supabaseAdmin
      .from('players')
      .select('id, name, handicap, user_id, team_id')
      .eq('team_id', match.team2_id)
      .eq('is_active', true)
      .order('handicap');

    // Fetch existing scorecards and scores
    const { data: scorecards } = await supabaseAdmin
      .from('scorecards')
      .select(`
        *,
        hole_scores(*)
      `)
      .eq('match_id', id);

    // Organize existing scores by player and hole
    const existingScores: Record<string, Record<string, number>> = {};
    scorecards?.forEach((scorecard) => {
      if (!existingScores[scorecard.player_id]) {
        existingScores[scorecard.player_id] = {};
      }
      scorecard.hole_scores?.forEach((holeScore: any) => {
        existingScores[scorecard.player_id][holeScore.hole_id] = holeScore.strokes;
      });
    });

    // Get team names
    const { data: team1 } = await supabaseAdmin
      .from('teams')
      .select('name')
      .eq('id', match.team1_id)
      .single();

    const { data: team2 } = await supabaseAdmin
      .from('teams')
      .select('name')
      .eq('id', match.team2_id)
      .single();

    // Build response with sorted holes and players
    const holes = (match.course?.holes || []).sort((a: any, b: any) => a.hole_number - b.hole_number);

    // Get current user session to determine team ordering
    let userId: string | undefined;
    try {
      const session = await getSession();
      userId = session?.user?.sub;
    } catch (error) {
      // Continue without user context
      userId = undefined;
    }

    // Determine if current user is on team2 (to reorder teams)
    let userIsOnTeam2 = false;
    if (userId && team2Players) {
      userIsOnTeam2 = team2Players.some((p) => p.user_id === userId);
    }

    // Reorder teams so current user's team appears first
    let players;
    if (userIsOnTeam2) {
      players = [
        ...(team2Players || []).map((p) => ({ ...p, team_name: team2?.name || 'Team 2' })),
        ...(team1Players || []).map((p) => ({ ...p, team_name: team1?.name || 'Team 1' })),
      ];
    } else {
      // Default: team1 first (either user is on team1 or not logged in)
      players = [
        ...(team1Players || []).map((p) => ({ ...p, team_name: team1?.name || 'Team 1' })),
        ...(team2Players || []).map((p) => ({ ...p, team_name: team2?.name || 'Team 2' })),
      ];
    }

    return NextResponse.json({
      match,
      holes,
      players,
      existing_scores: existingScores,
    });
  } catch (error) {
    console.error('Error in GET /api/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { id } = await params;
    const body = await request.json();
    const {
      course_id,
      match_date,
      holes_to_play,
      nine_selection,
      tee_selection,
      stimp_setting,
      pin_placement,
    } = body;

    // Fetch current match
    const { data: match } = await supabaseAdmin
      .from('matches')
      .select('status')
      .eq('id', id)
      .single();

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Don't allow editing completed matches
    if (match.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot edit completed matches' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (course_id !== undefined) {
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
      updates.course_id = course_id;
    }

    if (match_date !== undefined) {
      updates.match_date = match_date;
    }

    if (holes_to_play !== undefined) {
      if (![9, 18].includes(holes_to_play)) {
        return NextResponse.json(
          { error: 'holes_to_play must be 9 or 18' },
          { status: 400 }
        );
      }
      updates.holes_to_play = holes_to_play;
    }

    if (nine_selection !== undefined) {
      if (holes_to_play === 9 && !['front', 'back'].includes(nine_selection)) {
        return NextResponse.json(
          { error: 'nine_selection must be "front" or "back" when playing 9 holes' },
          { status: 400 }
        );
      }
      updates.nine_selection = nine_selection;
    }

    if (tee_selection !== undefined) {
      if (!['Black', 'Gold', 'Blue', 'White', 'Red'].includes(tee_selection)) {
        return NextResponse.json(
          { error: 'tee_selection must be one of: Black, Gold, Blue, White, Red' },
          { status: 400 }
        );
      }
      updates.tee_selection = tee_selection;
    }

    if (stimp_setting !== undefined) {
      const stimpValue = parseFloat(stimp_setting.toString());
      if (isNaN(stimpValue) || stimpValue < 1 || stimpValue > 12) {
        return NextResponse.json(
          { error: 'stimp_setting must be between 1.0 and 12.0' },
          { status: 400 }
        );
      }
      updates.stimp_setting = stimpValue;
    }

    if (pin_placement !== undefined) {
      if (!['Novice', 'Intermediate', 'Advanced'].includes(pin_placement)) {
        return NextResponse.json(
          { error: 'pin_placement must be one of: Novice, Intermediate, Advanced' },
          { status: 400 }
        );
      }
      updates.pin_placement = pin_placement;
    }

    // Update match
    const { data: updatedMatch, error: updateError } = await supabaseAdmin
      .from('matches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating match:', updateError);
      return NextResponse.json(
        { error: 'Failed to update match' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedMatch);
  } catch (error: any) {
    console.error('Error in PATCH /api/matches/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
