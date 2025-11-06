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

    const body = await request.json();
    const { exportType, tables = [] } = body;

    const exportData = {
      timestamp: new Date().toISOString(),
      exportType,
      metadata: {
        version: '1.0',
        generatedBy: 'Golf League Admin',
        userEmail: session?.user?.email || 'unknown'
      },
      data: {}
    };

    switch (exportType) {
      case 'leagues_summary':
        // Export basic league information
        const { data: leagues } = await supabaseAdmin
          .from('leagues')
          .select(`
            id, name, description, status, start_date, end_date,
            is_public, registration_open, created_at,
            admin:profiles!leagues_admin_id_fkey(name, email)
          `);
        exportData.data.leagues = leagues;

        // Add team counts
        if (leagues) {
          for (const league of leagues) {
            const { count: teamCount } = await supabaseAdmin
              .from('league_teams')
              .select('*', { count: 'exact', head: true })
              .eq('league_id', league.id);
            league.team_count = teamCount || 0;
          }
        }
        break;

      case 'users_summary':
        // Export user data (excluding sensitive info)
        const { data: users } = await supabaseAdmin
          .from('profiles')
          .select('id, name, display_name, created_at, last_sign_in, is_site_admin');
        exportData.data.users = users;
        break;

      case 'system_stats':
        // Export system statistics
        const tables_to_count = [
          'profiles', 'leagues', 'teams', 'players', 'matches',
          'scorecards', 'hole_scores', 'courses'
        ];

        const stats = {};
        for (const table of tables_to_count) {
          const { count } = await supabaseAdmin
            .from(table)
            .select('*', { count: 'exact', head: true });
          stats[table] = count || 0;
        }

        // Add activity stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: recentMatches } = await supabaseAdmin
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());

        const { count: recentUsers } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());

        exportData.data.statistics = {
          tableCounts: stats,
          recentActivity: {
            recentMatches: recentMatches || 0,
            recentUsers: recentUsers || 0
          }
        };
        break;

      case 'custom_tables':
        // Export specific tables (limited for security)
        const allowedTables = [
          'leagues', 'teams', 'matches', 'courses', 'announcements'
        ];

        for (const table of tables) {
          if (allowedTables.includes(table)) {
            try {
              const { data } = await supabaseAdmin
                .from(table)
                .select('*')
                .limit(1000); // Limit to prevent huge exports
              exportData.data[table] = data;
            } catch (error) {
              console.error(`Error exporting table ${table}:`, error);
              exportData.data[table] = { error: 'Failed to export' };
            }
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid export type. Supported: leagues_summary, users_summary, system_stats, custom_tables' },
          { status: 400 }
        );
    }

    // Set appropriate headers for file download
    const filename = `golf-league-${exportType}-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error: any) {
    console.error('Error in POST /api/admin/database/export:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}