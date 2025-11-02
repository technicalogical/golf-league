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

    // Get member counts
    const { data: memberCounts } = await supabaseAdmin
      .from('team_members')
      .select('team_id, count(*)')
      .group('team_id');

    // Get league counts
    const { data: leagueCounts } = await supabaseAdmin
      .from('league_teams')
      .select('team_id, count(*)')
      .group('team_id');

    // Combine the data
    const teamsWithCounts = teams?.map(team => ({
      ...team,
      member_count: memberCounts?.find(mc => mc.team_id === team.id)?.count || 0,
      league_count: leagueCounts?.find(lc => lc.team_id === team.id)?.count || 0,
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