import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET current scoring rule for a league
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params;

    // Get active league scoring rule
    const { data: leagueScoringRule, error } = await supabaseAdmin
      .from('league_scoring_rules')
      .select(`
        *,
        scoring_rule:scoring_rules(*)
      `)
      .eq('league_id', leagueId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is acceptable
      console.error('Error fetching league scoring rule:', error);
      return NextResponse.json(
        { error: 'Failed to fetch league scoring rule' },
        { status: 500 }
      );
    }

    return NextResponse.json(leagueScoringRule || null);
  } catch (error: any) {
    console.error('Error in GET /api/leagues/[id]/scoring-rules:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST or PUT - Assign scoring rule to league
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

    // Verify user is league admin
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'league_admin') {
      return NextResponse.json(
        { error: 'Only league administrators can change scoring rules' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      scoring_rule_id,
      override_hole_points,
      override_match_bonus_points,
      override_max_handicap_difference,
    } = body;

    if (!scoring_rule_id) {
      return NextResponse.json(
        { error: 'scoring_rule_id is required' },
        { status: 400 }
      );
    }

    // Verify scoring rule exists
    const { data: scoringRule, error: ruleError } = await supabaseAdmin
      .from('scoring_rules')
      .select('id')
      .eq('id', scoring_rule_id)
      .single();

    if (ruleError || !scoringRule) {
      return NextResponse.json(
        { error: 'Invalid scoring rule ID' },
        { status: 400 }
      );
    }

    // Deactivate any existing active scoring rules for this league
    await supabaseAdmin
      .from('league_scoring_rules')
      .update({ is_active: false })
      .eq('league_id', leagueId)
      .eq('is_active', true);

    // Create new league scoring rule
    const { data: newLeagueScoringRule, error: insertError } = await supabaseAdmin
      .from('league_scoring_rules')
      .insert({
        league_id: leagueId,
        scoring_rule_id: scoring_rule_id,
        is_active: true,
        override_hole_points,
        override_match_bonus_points,
        override_max_handicap_difference,
      })
      .select(`
        *,
        scoring_rule:scoring_rules(*)
      `)
      .single();

    if (insertError) {
      console.error('Error creating league scoring rule:', insertError);
      return NextResponse.json(
        { error: 'Failed to assign scoring rule to league' },
        { status: 500 }
      );
    }

    return NextResponse.json(newLeagueScoringRule, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/leagues/[id]/scoring-rules:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update league scoring rule overrides
export async function PUT(
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

    // Verify user is league admin
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'league_admin') {
      return NextResponse.json(
        { error: 'Only league administrators can update scoring rules' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      override_hole_points,
      override_match_bonus_points,
      override_max_handicap_difference,
    } = body;

    // Update the active league scoring rule
    const { data: updatedRule, error: updateError } = await supabaseAdmin
      .from('league_scoring_rules')
      .update({
        override_hole_points,
        override_match_bonus_points,
        override_max_handicap_difference,
        updated_at: new Date().toISOString(),
      })
      .eq('league_id', leagueId)
      .eq('is_active', true)
      .select(`
        *,
        scoring_rule:scoring_rules(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating league scoring rule:', updateError);
      return NextResponse.json(
        { error: 'Failed to update league scoring rule' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedRule);
  } catch (error: any) {
    console.error('Error in PUT /api/leagues/[id]/scoring-rules:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
