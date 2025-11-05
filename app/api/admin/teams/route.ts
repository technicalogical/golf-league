import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    if (!profile?.is_site_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Site admin access required' },
        { status: 403 }
      );
    }

    // Get all teams with captain info and counts
    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select(`
        id,
        name,
        captain_id,
        is_open,
        created_at,
        captain:profiles!teams_captain_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    }

    // Get all team IDs to fetch counts for
    const teamIds = teams?.map(team => team.id) || [];

    // Get member counts for each team
    const memberCountPromises = teamIds.map(async (teamId) => {
      const { count } = await supabaseAdmin
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);
      return { team_id: teamId, count: count || 0 };
    });

    // Get league counts for each team
    const leagueCountPromises = teamIds.map(async (teamId) => {
      const { count } = await supabaseAdmin
        .from('league_teams')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);
      return { team_id: teamId, count: count || 0 };
    });

    const [memberCounts, leagueCounts] = await Promise.all([
      Promise.all(memberCountPromises),
      Promise.all(leagueCountPromises)
    ]);

    // Combine the data
    const teamsWithCounts = teams?.map(team => ({
      ...team,
      member_count: memberCounts.find(mc => mc.team_id === team.id)?.count || 0,
      league_count: leagueCounts.find(lc => lc.team_id === team.id)?.count || 0,
    })) || [];

    return NextResponse.json(teamsWithCounts);
  } catch (error: any) {
    console.error('Error in GET /api/admin/teams:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}