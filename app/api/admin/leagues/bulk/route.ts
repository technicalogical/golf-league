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
    const { operation, leagueIds, data: operationData } = body;

    if (!leagueIds || !Array.isArray(leagueIds) || leagueIds.length === 0) {
      return NextResponse.json(
        { error: 'leagueIds must be a non-empty array' },
        { status: 400 }
      );
    }

    let results = [];

    switch (operation) {
      case 'updateStatus':
        if (!operationData?.status) {
          return NextResponse.json(
            { error: 'Status is required for updateStatus operation' },
            { status: 400 }
          );
        }

        const validStatuses = ['active', 'inactive', 'completed', 'cancelled'];
        if (!validStatuses.includes(operationData.status)) {
          return NextResponse.json(
            { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
            { status: 400 }
          );
        }

        for (const leagueId of leagueIds) {
          try {
            const { data, error } = await supabaseAdmin
              .from('leagues')
              .update({ status: operationData.status })
              .eq('id', leagueId)
              .select('name')
              .single();

            if (error) throw error;

            results.push({
              leagueId,
              success: true,
              name: data?.name || 'Unknown'
            });
          } catch (error: any) {
            results.push({
              leagueId,
              success: false,
              error: error.message
            });
          }
        }
        break;

      case 'updateVisibility':
        if (operationData?.is_public === undefined) {
          return NextResponse.json(
            { error: 'is_public is required for updateVisibility operation' },
            { status: 400 }
          );
        }

        for (const leagueId of leagueIds) {
          try {
            const { data, error } = await supabaseAdmin
              .from('leagues')
              .update({ is_public: operationData.is_public })
              .eq('id', leagueId)
              .select('name')
              .single();

            if (error) throw error;

            results.push({
              leagueId,
              success: true,
              name: data?.name || 'Unknown'
            });
          } catch (error: any) {
            results.push({
              leagueId,
              success: false,
              error: error.message
            });
          }
        }
        break;

      case 'updateRegistration':
        if (operationData?.registration_open === undefined) {
          return NextResponse.json(
            { error: 'registration_open is required for updateRegistration operation' },
            { status: 400 }
          );
        }

        for (const leagueId of leagueIds) {
          try {
            const { data, error } = await supabaseAdmin
              .from('leagues')
              .update({ registration_open: operationData.registration_open })
              .eq('id', leagueId)
              .select('name')
              .single();

            if (error) throw error;

            results.push({
              leagueId,
              success: true,
              name: data?.name || 'Unknown'
            });
          } catch (error: any) {
            results.push({
              leagueId,
              success: false,
              error: error.message
            });
          }
        }
        break;

      case 'delete':
        // Bulk delete - this is more complex as we need cascade deletion
        for (const leagueId of leagueIds) {
          try {
            // Get league name for logging
            const { data: league } = await supabaseAdmin
              .from('leagues')
              .select('name')
              .eq('id', leagueId)
              .single();

            if (!league) {
              results.push({
                leagueId,
                success: false,
                error: 'League not found'
              });
              continue;
            }

            // Perform cascade deletion (simplified version)
            // Delete in correct order for foreign key constraints

            // 1. Delete hole scores
            const { data: scorecardIds } = await supabaseAdmin
              .from('scorecards')
              .select('id')
              .in('match_id',
                supabaseAdmin
                  .from('matches')
                  .select('id')
                  .eq('league_id', leagueId)
              );

            if (scorecardIds && scorecardIds.length > 0) {
              await supabaseAdmin
                .from('hole_scores')
                .delete()
                .in('scorecard_id', scorecardIds.map(s => s.id));
            }

            // 2. Delete scorecards
            await supabaseAdmin
              .from('scorecards')
              .delete()
              .in('match_id',
                supabaseAdmin
                  .from('matches')
                  .select('id')
                  .eq('league_id', leagueId)
              );

            // 3. Delete matches
            await supabaseAdmin
              .from('matches')
              .delete()
              .eq('league_id', leagueId);

            // 4. Delete league relationships
            await supabaseAdmin.from('league_teams').delete().eq('league_id', leagueId);
            await supabaseAdmin.from('league_members').delete().eq('league_id', leagueId);
            await supabaseAdmin.from('announcements').delete().eq('league_id', leagueId);
            await supabaseAdmin.from('join_requests').delete().eq('league_id', leagueId);

            // 5. Finally delete the league
            const { error: leagueError } = await supabaseAdmin
              .from('leagues')
              .delete()
              .eq('id', leagueId);

            if (leagueError) throw leagueError;

            results.push({
              leagueId,
              success: true,
              name: league.name
            });
          } catch (error: any) {
            results.push({
              leagueId,
              success: false,
              error: error.message
            });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported: updateStatus, updateVisibility, updateRegistration, delete' },
          { status: 400 }
        );
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Bulk operation ${operation}: ${successCount} success, ${failureCount} failed`);

    return NextResponse.json({
      operation,
      results,
      summary: {
        total: leagueIds.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error: any) {
    console.error('Error in POST /api/admin/leagues/bulk:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}