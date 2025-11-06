import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { CreateScoringRuleRequest, ScoringRule } from '@/lib/types/scoring';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const systemDefault = searchParams.get('default') === 'true';

    let query = supabaseAdmin
      .from('scoring_rules')
      .select('*')
      .order('is_system_default', { ascending: false })
      .order('name');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (systemDefault) {
      query = query.eq('is_system_default', true);
    }

    const { data: scoringRules, error } = await query;

    if (error) {
      console.error('Error fetching scoring rules:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scoring rules' },
        { status: 500 }
      );
    }

    return NextResponse.json(scoringRules || []);
  } catch (error: any) {
    console.error('Error in GET /api/scoring-rules:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateScoringRuleRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.handicap_method || !body.stroke_holes || !body.point_method) {
      return NextResponse.json(
        { error: 'Missing required fields: name, handicap_method, stroke_holes, point_method' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (body.hole_points < 0 || body.match_bonus_points < 0) {
      return NextResponse.json(
        { error: 'Points must be non-negative numbers' },
        { status: 400 }
      );
    }

    // Validate handicap percentage if using percentage method
    if (body.handicap_method === 'percentage' && (!body.handicap_percentage || body.handicap_percentage <= 0 || body.handicap_percentage > 100)) {
      return NextResponse.json(
        { error: 'Handicap percentage must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Validate max handicap difference if using cap_difference method
    if (body.handicap_method === 'cap_difference' && (!body.max_handicap_difference || body.max_handicap_difference <= 0)) {
      return NextResponse.json(
        { error: 'Max handicap difference must be a positive number' },
        { status: 400 }
      );
    }

    const { data: newScoringRule, error } = await supabaseAdmin
      .from('scoring_rules')
      .insert({
        ...body,
        created_by: userId,
        is_active: true,
        is_system_default: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scoring rule:', error);
      return NextResponse.json(
        { error: 'Failed to create scoring rule' },
        { status: 500 }
      );
    }

    return NextResponse.json(newScoringRule, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/scoring-rules:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}