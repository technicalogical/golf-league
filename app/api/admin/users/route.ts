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

    // Get all users
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, display_name, is_site_admin, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get all user IDs to fetch counts for
    const userIds = users?.map(user => user.id) || [];

    // Get team counts for each user
    const teamCountPromises = userIds.map(async (userId) => {
      const { count } = await supabaseAdmin
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return { user_id: userId, count: count || 0 };
    });

    // Get league counts for each user
    const leagueCountPromises = userIds.map(async (userId) => {
      const { count } = await supabaseAdmin
        .from('league_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return { user_id: userId, count: count || 0 };
    });

    const [teamCounts, leagueCounts] = await Promise.all([
      Promise.all(teamCountPromises),
      Promise.all(leagueCountPromises)
    ]);

    // Combine the data
    const usersWithCounts = users?.map(user => ({
      ...user,
      teams_count: teamCounts.find(tc => tc.user_id === user.id)?.count || 0,
      leagues_count: leagueCounts.find(lc => lc.user_id === user.id)?.count || 0,
    })) || [];

    return NextResponse.json(usersWithCounts);
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}