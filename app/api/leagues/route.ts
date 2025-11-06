import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      await supabaseAdmin.from('profiles').insert({
        id: userId,
        email: session.user.email,
        name: session.user.name,
        avatar_url: session.user.picture,
      });
    }

    const body = await request.json();
    const { name, description, start_date, end_date, day_of_week, time_of_day, status = 'upcoming', scoring_rule_id } = body;

    // Validate input
    if (!name || !start_date) {
      return NextResponse.json(
        { error: 'name and start_date are required' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['upcoming', 'active', 'completed', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Create league
    const { data: league, error: leagueError } = await supabaseAdmin
      .from('leagues')
      .insert({
        name,
        description,
        start_date,
        end_date,
        day_of_week,
        time_of_day,
        status,
        created_by: userId,
      })
      .select()
      .single();

    if (leagueError) {
      console.error('Error creating league:', leagueError);
      return NextResponse.json(
        { error: 'Failed to create league' },
        { status: 500 }
      );
    }

    // Add creator as league admin
    await supabaseAdmin.from('league_members').insert({
      league_id: league.id,
      user_id: userId,
      role: 'league_admin',
    });

    // Assign scoring rule to league
    let ruleIdToAssign = scoring_rule_id;

    // If no scoring rule provided, get the default one
    if (!ruleIdToAssign) {
      const { data: defaultRule } = await supabaseAdmin
        .from('scoring_rules')
        .select('id')
        .eq('is_system_default', true)
        .eq('is_active', true)
        .single();

      if (defaultRule) {
        ruleIdToAssign = defaultRule.id;
      }
    }

    // Assign the scoring rule if we have one
    if (ruleIdToAssign) {
      const { error: scoringError } = await supabaseAdmin
        .from('league_scoring_rules')
        .insert({
          league_id: league.id,
          scoring_rule_id: ruleIdToAssign,
          is_active: true,
        });

      if (scoringError) {
        console.error('Error assigning scoring rule to league:', scoringError);
        // Don't fail the whole request, just log it
      }
    }

    return NextResponse.json(league, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/leagues:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: leagues, error } = await supabaseAdmin
      .from('leagues')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching leagues:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leagues' },
        { status: 500 }
      );
    }

    return NextResponse.json(leagues);
  } catch (error) {
    console.error('Error in GET /api/leagues:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
