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
      .select('id, name, email, display_name, is_site_admin, created_at, last_sign_in')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get team counts for each user
    const { data: teamCounts } = await supabaseAdmin
      .from('team_members')
      .select('user_id, count(*)')
      .group('user_id');

    // Get league counts for each user
    const { data: leagueCounts } = await supabaseAdmin
      .from('league_members')
      .select('user_id, count(*)')
      .group('user_id');

    // Combine the data
    const usersWithCounts = users?.map(user => ({
      ...user,
      teams_count: teamCounts?.find(tc => tc.user_id === user.id)?.count || 0,
      leagues_count: leagueCounts?.find(lc => lc.user_id === user.id)?.count || 0,
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