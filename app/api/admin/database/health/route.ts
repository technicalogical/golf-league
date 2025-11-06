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

    // Database health checks
    const healthChecks = {
      tableCounts: {},
      orphanedRecords: {},
      dataConsistency: {},
      storageStats: {}
    };

    // 1. Get table counts for all major tables
    const tables = [
      'profiles', 'leagues', 'teams', 'players', 'matches', 'scorecards',
      'hole_scores', 'courses', 'league_members', 'league_teams',
      'team_members', 'announcements', 'join_requests'
    ];

    for (const table of tables) {
      try {
        const { count } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });
        healthChecks.tableCounts[table] = count || 0;
      } catch (error) {
        healthChecks.tableCounts[table] = 'Error';
      }
    }

    // 2. Find orphaned records

    // Orphaned players (players without teams)
    const { data: orphanedPlayers } = await supabaseAdmin
      .from('players')
      .select('id, name, user_id')
      .not('user_id', 'in', `(${
        supabaseAdmin
          .from('team_members')
          .select('user_id')
      })`);
    healthChecks.orphanedRecords.players = orphanedPlayers?.length || 0;

    // Orphaned scorecards (scorecards without matches)
    const { data: orphanedScorecards } = await supabaseAdmin
      .from('scorecards')
      .select('id')
      .not('match_id', 'in', `(${
        supabaseAdmin
          .from('matches')
          .select('id')
      })`);
    healthChecks.orphanedRecords.scorecards = orphanedScorecards?.length || 0;

    // Orphaned hole scores (hole_scores without scorecards)
    const { data: orphanedHoleScores } = await supabaseAdmin
      .from('hole_scores')
      .select('id')
      .not('scorecard_id', 'in', `(${
        supabaseAdmin
          .from('scorecards')
          .select('id')
      })`);
    healthChecks.orphanedRecords.holeScores = orphanedHoleScores?.length || 0;

    // Teams without leagues
    const { data: orphanedTeams } = await supabaseAdmin
      .from('teams')
      .select('id, name')
      .not('id', 'in', `(${
        supabaseAdmin
          .from('league_teams')
          .select('team_id')
      })`);
    healthChecks.orphanedRecords.teams = orphanedTeams?.length || 0;

    // 3. Data consistency checks

    // Profiles without Auth0 sync
    const { data: profilesWithoutAuth } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .is('name', null)
      .is('email', null);
    healthChecks.dataConsistency.incompleteProfiles = profilesWithoutAuth?.length || 0;

    // Matches without scorecards
    const { data: matchesWithoutScorecards } = await supabaseAdmin
      .from('matches')
      .select('id')
      .not('id', 'in', `(${
        supabaseAdmin
          .from('scorecards')
          .select('match_id')
      })`);
    healthChecks.dataConsistency.matchesWithoutScorecards = matchesWithoutScorecards?.length || 0;

    // League members not in any teams within their leagues
    const { data: leagueMembersWithoutTeams } = await supabaseAdmin
      .rpc('get_league_members_without_teams');
    healthChecks.dataConsistency.leagueMembersWithoutTeams = leagueMembersWithoutTeams?.length || 0;

    // 4. Storage and performance stats
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Recent activity
    const { count: recentMatches } = await supabaseAdmin
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());
    healthChecks.storageStats.recentMatches = recentMatches || 0;

    const { count: recentProfiles } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());
    healthChecks.storageStats.recentProfiles = recentProfiles || 0;

    // Calculate total records
    const totalRecords = Object.values(healthChecks.tableCounts)
      .filter(count => typeof count === 'number')
      .reduce((sum, count) => sum + count, 0);
    healthChecks.storageStats.totalRecords = totalRecords;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      health: healthChecks,
      summary: {
        totalTables: tables.length,
        totalRecords,
        orphanedRecords: Object.values(healthChecks.orphanedRecords).reduce((sum, count) => sum + count, 0),
        consistencyIssues: Object.values(healthChecks.dataConsistency).reduce((sum, count) => sum + count, 0),
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/database/health:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}