import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leagueId } = await params;

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

    // Get league info for logging
    const { data: league } = await supabaseAdmin
      .from('leagues')
      .select('name')
      .eq('id', leagueId)
      .single();

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    // CASCADE DELETE - Order matters for foreign key constraints
    console.log(`Starting cascade deletion for league: ${league.name}`);

    // 1. First get matches for this league
    const { data: matches } = await supabaseAdmin
      .from('matches')
      .select('id')
      .eq('league_id', leagueId);

    if (matches && matches.length > 0) {
      const matchIds = matches.map(m => m.id);

      // Get scorecards for these matches
      const { data: scorecards } = await supabaseAdmin
        .from('scorecards')
        .select('id')
        .in('match_id', matchIds);

      if (scorecards && scorecards.length > 0) {
        const scorecardIds = scorecards.map(s => s.id);

        // Delete hole scores for these scorecards
        await supabaseAdmin
          .from('hole_scores')
          .delete()
          .in('scorecard_id', scorecardIds);
        console.log(`Deleted hole scores for ${scorecardIds.length} scorecards`);
      }

      // Delete scorecards for these matches
      await supabaseAdmin
        .from('scorecards')
        .delete()
        .in('match_id', matchIds);
      console.log('Deleted scorecards');
    }

    // 3. Delete matches
    const { error: matchError } = await supabaseAdmin
      .from('matches')
      .delete()
      .eq('league_id', leagueId);

    if (matchError) {
      console.error('Error deleting matches:', matchError);
      return NextResponse.json(
        { error: 'Failed to delete matches' },
        { status: 500 }
      );
    }
    console.log('Deleted matches');

    // 4. Delete players (only those who are only in this league)
    const { data: leagueMembers } = await supabaseAdmin
      .from('league_members')
      .select('user_id')
      .eq('league_id', leagueId);

    if (leagueMembers && leagueMembers.length > 0) {
      const userIds = leagueMembers.map(m => m.user_id);

      const { data: playersToDelete } = await supabaseAdmin
        .from('players')
        .select('id, user_id')
        .in('user_id', userIds);

      if (playersToDelete) {
        for (const player of playersToDelete) {
          // Check if player is in other leagues
          const { count: otherLeagueCount } = await supabaseAdmin
            .from('league_members')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', player.user_id)
            .neq('league_id', leagueId);

          // Only delete if not in other leagues
          if (otherLeagueCount === 0) {
            await supabaseAdmin
              .from('players')
              .delete()
              .eq('id', player.id);
          }
        }
        console.log('Deleted isolated players');
      }
    }

    // 5. Delete league_teams relationships
    await supabaseAdmin
      .from('league_teams')
      .delete()
      .eq('league_id', leagueId);
    console.log('Deleted league_teams relationships');

    // 6. Delete league members
    await supabaseAdmin
      .from('league_members')
      .delete()
      .eq('league_id', leagueId);
    console.log('Deleted league members');

    // 7. Delete announcements
    await supabaseAdmin
      .from('league_announcements')
      .delete()
      .eq('league_id', leagueId);
    console.log('Deleted announcements');

    // 8. Delete join requests
    await supabaseAdmin
      .from('league_join_requests')
      .delete()
      .eq('league_id', leagueId);
    console.log('Deleted join requests');

    // 9. Finally, delete the league itself
    const { error: leagueError } = await supabaseAdmin
      .from('leagues')
      .delete()
      .eq('id', leagueId);

    if (leagueError) {
      console.error('Error deleting league:', leagueError);
      return NextResponse.json(
        { error: 'Failed to delete league' },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted league: ${league.name}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/leagues/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}