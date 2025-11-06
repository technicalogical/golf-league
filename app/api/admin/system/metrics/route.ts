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

    const metrics = {
      timestamp: new Date().toISOString(),
      system: {},
      activity: {},
      performance: {},
      users: {}
    };

    // System Overview
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalLeagues } = await supabaseAdmin
      .from('leagues')
      .select('*', { count: 'exact', head: true });

    const { count: totalTeams } = await supabaseAdmin
      .from('teams')
      .select('*', { count: 'exact', head: true });

    const { count: totalMatches } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true });

    const { count: completedMatches } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    metrics.system = {
      totalUsers: totalUsers || 0,
      totalLeagues: totalLeagues || 0,
      totalTeams: totalTeams || 0,
      totalMatches: totalMatches || 0,
      completedMatches: completedMatches || 0,
      matchCompletionRate: totalMatches ? (completedMatches / totalMatches * 100).toFixed(1) : 0
    };

    // Time-based activity metrics
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Recent activity
    const { count: newUsers24h } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24Hours.toISOString());

    const { count: newUsers7d } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days.toISOString());

    const { count: newUsers30d } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last30Days.toISOString());

    const { count: activeUsers7d } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in', last7Days.toISOString());

    const { count: newMatches24h } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last24Hours.toISOString());

    const { count: newMatches7d } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last7Days.toISOString());

    const { count: newLeagues30d } = await supabaseAdmin
      .from('leagues')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last30Days.toISOString());

    metrics.activity = {
      newUsers: {
        last24Hours: newUsers24h || 0,
        last7Days: newUsers7d || 0,
        last30Days: newUsers30d || 0
      },
      activeUsers: {
        last7Days: activeUsers7d || 0
      },
      newMatches: {
        last24Hours: newMatches24h || 0,
        last7Days: newMatches7d || 0
      },
      newLeagues: {
        last30Days: newLeagues30d || 0
      }
    };

    // User engagement metrics
    const { data: userEngagement } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .not('last_sign_in', 'is', null);

    const { count: adminUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_site_admin', true);

    // Team participation
    const { count: usersWithTeams } = await supabaseAdmin
      .from('team_members')
      .select('user_id', { count: 'exact', head: true });

    // League participation
    const { count: usersInLeagues } = await supabaseAdmin
      .from('league_members')
      .select('user_id', { count: 'exact', head: true });

    metrics.users = {
      totalEngaged: userEngagement?.length || 0,
      adminUsers: adminUsers || 0,
      usersWithTeams: usersWithTeams || 0,
      usersInLeagues: usersInLeagues || 0,
      engagementRate: totalUsers ? ((userEngagement?.length || 0) / totalUsers * 100).toFixed(1) : 0
    };

    // Performance metrics
    const { data: largestLeagues } = await supabaseAdmin
      .rpc('get_largest_leagues', {}, { count: 'exact' });

    const { data: recentErrors } = await supabaseAdmin
      .from('profiles')
      .select('created_at')
      .is('name', null)
      .gte('created_at', last7Days.toISOString());

    // Storage usage estimation
    const { count: totalScores } = await supabaseAdmin
      .from('hole_scores')
      .select('*', { count: 'exact', head: true });

    const { count: totalScorecards } = await supabaseAdmin
      .from('scorecards')
      .select('*', { count: 'exact', head: true });

    metrics.performance = {
      largestLeagueSize: largestLeagues?.[0]?.team_count || 0,
      totalScores: totalScores || 0,
      totalScorecards: totalScorecards || 0,
      avgScoresPerScorecard: totalScorecards ? (totalScores / totalScorecards).toFixed(1) : 0,
      incompleteProfiles: recentErrors?.length || 0
    };

    // Growth trends (simple week-over-week)
    const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const { count: users7to14Days } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last14Days.toISOString())
      .lt('created_at', last7Days.toISOString());

    const { count: matches7to14Days } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', last14Days.toISOString())
      .lt('created_at', last7Days.toISOString());

    metrics.trends = {
      userGrowth: {
        thisWeek: newUsers7d || 0,
        lastWeek: users7to14Days || 0,
        growthRate: users7to14Days ? (((newUsers7d || 0) - users7to14Days) / users7to14Days * 100).toFixed(1) : 0
      },
      matchGrowth: {
        thisWeek: newMatches7d || 0,
        lastWeek: matches7to14Days || 0,
        growthRate: matches7to14Days ? (((newMatches7d || 0) - matches7to14Days) / matches7to14Days * 100).toFixed(1) : 0
      }
    };

    return NextResponse.json(metrics);

  } catch (error: any) {
    console.error('Error in GET /api/admin/system/metrics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}