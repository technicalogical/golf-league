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

    // Get all leagues with admin info
    const { data: leagues, error } = await supabaseAdmin
      .from('leagues')
      .select(`
        id,
        name,
        description,
        status,
        start_date,
        end_date,
        is_public,
        registration_open,
        created_at,
        created_by,
        admin:profiles!leagues_created_by_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leagues:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leagues' },
        { status: 500 }
      );
    }

    // Get all league IDs to fetch counts for
    const leagueIds = leagues?.map(league => league.id) || [];

    // Get team counts for each league
    const teamCountPromises = leagueIds.map(async (leagueId) => {
      const { count } = await supabaseAdmin
        .from('league_teams')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId);
      return { league_id: leagueId, count: count || 0 };
    });

    // Get member counts for each league
    const memberCountPromises = leagueIds.map(async (leagueId) => {
      const { count } = await supabaseAdmin
        .from('league_members')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId);
      return { league_id: leagueId, count: count || 0 };
    });

    // Get match counts for each league
    const matchCountPromises = leagueIds.map(async (leagueId) => {
      const { count } = await supabaseAdmin
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId);
      return { league_id: leagueId, count: count || 0 };
    });

    const [teamCounts, memberCounts, matchCounts] = await Promise.all([
      Promise.all(teamCountPromises),
      Promise.all(memberCountPromises),
      Promise.all(matchCountPromises)
    ]);

    // Combine the data
    const leaguesWithStats = leagues?.map(league => ({
      ...league,
      team_count: teamCounts.find(tc => tc.league_id === league.id)?.count || 0,
      member_count: memberCounts.find(mc => mc.league_id === league.id)?.count || 0,
      match_count: matchCounts.find(mc => mc.league_id === league.id)?.count || 0,
    })) || [];

    return NextResponse.json(leaguesWithStats);
  } catch (error: any) {
    console.error('Error in GET /api/admin/leagues:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}