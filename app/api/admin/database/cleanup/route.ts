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
    const { operation, dryRun = true } = body;

    const results = {
      operation,
      dryRun,
      timestamp: new Date().toISOString(),
      cleaned: {},
      errors: []
    };

    switch (operation) {
      case 'orphaned_hole_scores':
        try {
          if (dryRun) {
            const { data: orphanedHoleScores } = await supabaseAdmin
              .from('hole_scores')
              .select('id')
              .not('scorecard_id', 'in', `(${
                supabaseAdmin
                  .from('scorecards')
                  .select('id')
              })`);
            results.cleaned.holeScores = orphanedHoleScores?.length || 0;
          } else {
            const { data: orphanedHoleScores } = await supabaseAdmin
              .from('hole_scores')
              .delete()
              .not('scorecard_id', 'in', `(${
                supabaseAdmin
                  .from('scorecards')
                  .select('id')
              })`)
              .select('id');
            results.cleaned.holeScores = orphanedHoleScores?.length || 0;
            console.log(`Cleaned ${results.cleaned.holeScores} orphaned hole scores`);
          }
        } catch (error: any) {
          results.errors.push(`hole_scores: ${error.message}`);
        }
        break;

      case 'orphaned_scorecards':
        try {
          if (dryRun) {
            const { data: orphanedScorecards } = await supabaseAdmin
              .from('scorecards')
              .select('id')
              .not('match_id', 'in', `(${
                supabaseAdmin
                  .from('matches')
                  .select('id')
              })`);
            results.cleaned.scorecards = orphanedScorecards?.length || 0;
          } else {
            // First clean hole scores for these scorecards
            const { data: orphanedScorecards } = await supabaseAdmin
              .from('scorecards')
              .select('id')
              .not('match_id', 'in', `(${
                supabaseAdmin
                  .from('matches')
                  .select('id')
              })`);

            if (orphanedScorecards && orphanedScorecards.length > 0) {
              // Delete hole scores first
              await supabaseAdmin
                .from('hole_scores')
                .delete()
                .in('scorecard_id', orphanedScorecards.map(s => s.id));

              // Then delete scorecards
              const { data: deletedScorecards } = await supabaseAdmin
                .from('scorecards')
                .delete()
                .in('id', orphanedScorecards.map(s => s.id))
                .select('id');

              results.cleaned.scorecards = deletedScorecards?.length || 0;
            } else {
              results.cleaned.scorecards = 0;
            }
            console.log(`Cleaned ${results.cleaned.scorecards} orphaned scorecards`);
          }
        } catch (error: any) {
          results.errors.push(`scorecards: ${error.message}`);
        }
        break;

      case 'orphaned_players':
        try {
          if (dryRun) {
            const { data: orphanedPlayers } = await supabaseAdmin
              .from('players')
              .select('id')
              .not('user_id', 'in', `(${
                supabaseAdmin
                  .from('team_members')
                  .select('user_id')
              })`);
            results.cleaned.players = orphanedPlayers?.length || 0;
          } else {
            const { data: deletedPlayers } = await supabaseAdmin
              .from('players')
              .delete()
              .not('user_id', 'in', `(${
                supabaseAdmin
                  .from('team_members')
                  .select('user_id')
              })`)
              .select('id');
            results.cleaned.players = deletedPlayers?.length || 0;
            console.log(`Cleaned ${results.cleaned.players} orphaned players`);
          }
        } catch (error: any) {
          results.errors.push(`players: ${error.message}`);
        }
        break;

      case 'incomplete_profiles':
        try {
          if (dryRun) {
            const { data: incompleteProfiles } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .or('name.is.null,email.is.null');
            results.cleaned.incompleteProfiles = incompleteProfiles?.length || 0;
          } else {
            // Don't actually delete profiles, just mark them for review
            const { data: incompleteProfiles } = await supabaseAdmin
              .from('profiles')
              .select('id, name, email')
              .or('name.is.null,email.is.null');
            results.cleaned.incompleteProfiles = incompleteProfiles?.length || 0;
            // This would be a manual review process, not auto-delete
            console.log(`Found ${results.cleaned.incompleteProfiles} incomplete profiles for review`);
          }
        } catch (error: any) {
          results.errors.push(`profiles: ${error.message}`);
        }
        break;

      case 'old_announcements':
        try {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

          if (dryRun) {
            const { data: oldAnnouncements } = await supabaseAdmin
              .from('announcements')
              .select('id')
              .lt('created_at', sixMonthsAgo.toISOString());
            results.cleaned.oldAnnouncements = oldAnnouncements?.length || 0;
          } else {
            const { data: deletedAnnouncements } = await supabaseAdmin
              .from('announcements')
              .delete()
              .lt('created_at', sixMonthsAgo.toISOString())
              .select('id');
            results.cleaned.oldAnnouncements = deletedAnnouncements?.length || 0;
            console.log(`Cleaned ${results.cleaned.oldAnnouncements} old announcements`);
          }
        } catch (error: any) {
          results.errors.push(`announcements: ${error.message}`);
        }
        break;

      case 'vacuum_analyze':
        if (!dryRun) {
          try {
            // This would typically be a database-level operation
            // For Supabase, we'll just log that this was requested
            console.log('VACUUM ANALYZE requested - this should be done at database level');
            results.cleaned.vacuumAnalyze = 'Requested (database-level operation)';
          } catch (error: any) {
            results.errors.push(`vacuum: ${error.message}`);
          }
        } else {
          results.cleaned.vacuumAnalyze = 'Would perform VACUUM ANALYZE';
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid operation. Supported: orphaned_hole_scores, orphaned_scorecards, orphaned_players, incomplete_profiles, old_announcements, vacuum_analyze' },
          { status: 400 }
        );
    }

    const totalCleaned = Object.values(results.cleaned)
      .filter(val => typeof val === 'number')
      .reduce((sum, val) => sum + val, 0);

    return NextResponse.json({
      ...results,
      summary: {
        totalCleaned,
        errorsCount: results.errors.length,
        success: results.errors.length === 0
      }
    });

  } catch (error: any) {
    console.error('Error in POST /api/admin/database/cleanup:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}