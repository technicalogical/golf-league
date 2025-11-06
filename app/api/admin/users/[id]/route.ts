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

    const { id: targetUserId } = await params;

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

    // Prevent user from deleting themselves
    if (userId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get user info for logging
    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // CASCADE DELETE - Order matters for foreign key constraints
    console.log(`Starting cascade deletion for user: ${targetUser.email}`);

    // 1. Delete hole scores first (deepest level)
    const { data: players } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('user_id', targetUserId);

    if (players && players.length > 0) {
      const playerIds = players.map(p => p.id);

      // Get scorecards for these players
      const { data: scorecards } = await supabaseAdmin
        .from('scorecards')
        .select('id')
        .in('player_id', playerIds);

      if (scorecards && scorecards.length > 0) {
        const scorecardIds = scorecards.map(s => s.id);

        // Delete hole scores for these scorecards
        await supabaseAdmin
          .from('hole_scores')
          .delete()
          .in('scorecard_id', scorecardIds);
        console.log(`Deleted hole scores for ${scorecardIds.length} scorecards`);
      }

      // Delete scorecards for these players
      await supabaseAdmin
        .from('scorecards')
        .delete()
        .in('player_id', playerIds);
      console.log('Deleted scorecards');
    }

    // 2. Delete players
    await supabaseAdmin
      .from('players')
      .delete()
      .eq('user_id', targetUserId);
    console.log('Deleted players');

    // 3. Update teams where user is captain (set to null)
    await supabaseAdmin
      .from('teams')
      .update({ captain_id: null })
      .eq('captain_id', targetUserId);
    console.log('Removed user as team captain');

    // 4. Update teams where user is creator (set to null)
    await supabaseAdmin
      .from('teams')
      .update({ created_by: null })
      .eq('created_by', targetUserId);
    console.log('Removed user as team creator');

    // 5. Update leagues where user is creator (set to null)
    await supabaseAdmin
      .from('leagues')
      .update({ created_by: null })
      .eq('created_by', targetUserId);
    console.log('Removed user as league creator');

    // 6. Delete team memberships
    await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('user_id', targetUserId);
    console.log('Deleted team memberships');

    // 7. Delete league memberships
    await supabaseAdmin
      .from('league_members')
      .delete()
      .eq('user_id', targetUserId);
    console.log('Deleted league memberships');

    // 8. Delete announcements created by user
    await supabaseAdmin
      .from('league_announcements')
      .delete()
      .eq('created_by', targetUserId);
    console.log('Deleted announcements');

    // 9. Delete join requests made by user
    await supabaseAdmin
      .from('league_join_requests')
      .delete()
      .eq('requested_by', targetUserId);
    console.log('Deleted join requests made by user');

    // 10. Update join requests reviewed by user (set to null)
    await supabaseAdmin
      .from('league_join_requests')
      .update({ reviewed_by: null })
      .eq('reviewed_by', targetUserId);
    console.log('Removed user as join request reviewer');

    // 11. Finally, delete the user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', targetUserId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to delete user profile' },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted user: ${targetUser.email}`);
    return NextResponse.json({
      success: true,
      message: `User "${targetUser.name || targetUser.email}" has been permanently deleted`
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}