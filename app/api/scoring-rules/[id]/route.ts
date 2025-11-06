import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { UpdateScoringRuleRequest } from '@/lib/types/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: scoringRule, error } = await supabaseAdmin
      .from('scoring_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching scoring rule:', error);
      return NextResponse.json(
        { error: 'Scoring rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scoringRule);
  } catch (error: any) {
    console.error('Error in GET /api/scoring-rules/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { id } = await params;
    const body: Partial<UpdateScoringRuleRequest> = await request.json();

    // Check if scoring rule exists and user has permission to edit
    const { data: existingRule, error: fetchError } = await supabaseAdmin
      .from('scoring_rules')
      .select('created_by, is_system_default')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Scoring rule not found' },
        { status: 404 }
      );
    }

    // Check if user is site admin for system defaults
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    // Only allow editing if user created it OR user is admin for system defaults
    if (existingRule.created_by !== userId && !profile?.is_site_admin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit scoring rules you created' },
        { status: 403 }
      );
    }

    // Validate fields if provided
    if (body.hole_points !== undefined && body.hole_points < 0) {
      return NextResponse.json(
        { error: 'Hole points must be non-negative' },
        { status: 400 }
      );
    }

    if (body.match_bonus_points !== undefined && body.match_bonus_points < 0) {
      return NextResponse.json(
        { error: 'Match bonus points must be non-negative' },
        { status: 400 }
      );
    }

    if (body.handicap_method === 'percentage' && body.handicap_percentage &&
        (body.handicap_percentage <= 0 || body.handicap_percentage > 100)) {
      return NextResponse.json(
        { error: 'Handicap percentage must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (body.handicap_method === 'cap_difference' && body.max_handicap_difference &&
        body.max_handicap_difference <= 0) {
      return NextResponse.json(
        { error: 'Max handicap difference must be positive' },
        { status: 400 }
      );
    }

    const { data: updatedRule, error } = await supabaseAdmin
      .from('scoring_rules')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scoring rule:', error);
      return NextResponse.json(
        { error: 'Failed to update scoring rule' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedRule);
  } catch (error: any) {
    console.error('Error in PUT /api/scoring-rules/[id]:', error);
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

    const { id } = await params;

    // Check if scoring rule exists and user has permission to delete
    const { data: existingRule, error: fetchError } = await supabaseAdmin
      .from('scoring_rules')
      .select('created_by, is_system_default, name')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Scoring rule not found' },
        { status: 404 }
      );
    }

    // Check if user is site admin for system defaults
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    // Only allow deletion if user created it OR user is admin
    if (existingRule.created_by !== userId && !profile?.is_site_admin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete scoring rules you created' },
        { status: 403 }
      );
    }

    // Prevent deletion of system defaults unless admin
    if (existingRule.is_system_default && !profile?.is_site_admin) {
      return NextResponse.json(
        { error: 'System default scoring rules can only be deleted by administrators' },
        { status: 403 }
      );
    }

    // Check if scoring rule is in use by any leagues
    const { data: leagueUsage, error: usageError } = await supabaseAdmin
      .from('league_scoring_rules')
      .select('league_id')
      .eq('scoring_rule_id', id)
      .eq('is_active', true);

    if (usageError) {
      console.error('Error checking scoring rule usage:', usageError);
      return NextResponse.json(
        { error: 'Failed to check scoring rule usage' },
        { status: 500 }
      );
    }

    if (leagueUsage && leagueUsage.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete scoring rule "${existingRule.name}" - it is currently used by ${leagueUsage.length} league(s)` },
        { status: 400 }
      );
    }

    // Mark as inactive instead of hard delete to preserve historical data
    const { error: updateError } = await supabaseAdmin
      .from('scoring_rules')
      .update({ is_active: false })
      .eq('id', id);

    if (updateError) {
      console.error('Error deactivating scoring rule:', updateError);
      return NextResponse.json(
        { error: 'Failed to delete scoring rule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Scoring rule "${existingRule.name}" has been deleted`
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/scoring-rules/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}