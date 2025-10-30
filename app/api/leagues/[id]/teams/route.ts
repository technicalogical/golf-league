import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params;

    // Fetch teams in this league
    const { data: leagueTeams, error } = await supabaseAdmin
      .from('league_teams')
      .select(`
        id,
        team_id,
        joined_at,
        team:teams(
          id,
          name,
          is_active
        )
      `)
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error fetching league teams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch league teams' },
        { status: 500 }
      );
    }

    return NextResponse.json(leagueTeams || []);
  } catch (error: any) {
    console.error('Error in GET /api/leagues/[id]/teams:', error);
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
    const { team_ids } = body;

    // Validate input
    if (!team_ids || !Array.isArray(team_ids) || team_ids.length === 0) {
      return NextResponse.json(
        { error: 'team_ids array is required' },
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
        { error: 'Forbidden: Only league admins can add teams' },
        { status: 403 }
      );
    }

    // Verify all teams exist and are active
    const { data: teams, error: teamsError } = await supabaseAdmin
      .from('teams')
      .select('id, is_active')
      .in('id', team_ids);

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json(
        { error: 'Failed to verify teams' },
        { status: 500 }
      );
    }

    if (!teams || teams.length !== team_ids.length) {
      return NextResponse.json(
        { error: 'One or more teams not found' },
        { status: 404 }
      );
    }

    const inactiveTeams = teams.filter(t => !t.is_active);
    if (inactiveTeams.length > 0) {
      return NextResponse.json(
        { error: 'Cannot add inactive teams to league' },
        { status: 400 }
      );
    }

    // Check if any teams are already in the league
    const { data: existingTeams } = await supabaseAdmin
      .from('league_teams')
      .select('team_id')
      .eq('league_id', leagueId)
      .in('team_id', team_ids);

    if (existingTeams && existingTeams.length > 0) {
      const alreadyInLeague = existingTeams.map(et => et.team_id);
      return NextResponse.json(
        { error: `Some teams are already in this league: ${alreadyInLeague.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert teams into league
    const leagueTeamsData = team_ids.map(team_id => ({
      league_id: leagueId,
      team_id,
    }));

    const { data: insertedTeams, error: insertError } = await supabaseAdmin
      .from('league_teams')
      .insert(leagueTeamsData)
      .select();

    if (insertError) {
      console.error('Error adding teams to league:', insertError);
      return NextResponse.json(
        { error: 'Failed to add teams to league' },
        { status: 500 }
      );
    }

    // Add all team members to league_members
    for (const teamId of team_ids) {
      // Get all members of this team
      const { data: teamMembers } = await supabaseAdmin
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (teamMembers && teamMembers.length > 0) {
        for (const member of teamMembers) {
          // Check if user is already a league member
          const { data: existingMember } = await supabaseAdmin
            .from('league_members')
            .select('id')
            .eq('league_id', leagueId)
            .eq('user_id', member.user_id)
            .single();

          if (!existingMember) {
            // Add user as player role in the league
            await supabaseAdmin
              .from('league_members')
              .insert({
                league_id: leagueId,
                user_id: member.user_id,
                role: 'player',
              });
          }
        }
      }
    }

    return NextResponse.json(
      { message: `Successfully added ${team_ids.length} team(s) to league`, teams: insertedTeams },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/leagues/[id]/teams:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
