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

    const { id: teamId } = await params;

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

    // Get team info for logging
    const { data: team } = await supabaseAdmin
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Delete in the correct order due to foreign key constraints

    // 1. Delete hole scores (if any matches exist)
    await supabaseAdmin
      .from('hole_scores')
      .delete()
      .in('scorecard_id',
        supabaseAdmin
          .from('scorecards')
          .select('id')
          .in('player_id',
            supabaseAdmin
              .from('players')
              .select('id')
              .eq('team_id', teamId)
          )
      );

    // 2. Delete scorecards
    await supabaseAdmin
      .from('scorecards')
      .delete()
      .in('player_id',
        supabaseAdmin
          .from('players')
          .select('id')
          .eq('team_id', teamId)
      );

    // 3. Delete matches involving this team
    await supabaseAdmin
      .from('matches')
      .delete()
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);

    // 4. Delete players
    await supabaseAdmin
      .from('players')
      .delete()
      .eq('team_id', teamId);

    // 5. Delete league team associations
    await supabaseAdmin
      .from('league_teams')
      .delete()
      .eq('team_id', teamId);

    // 6. Delete team members
    await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_id', teamId);

    // 7. Finally delete the team
    const { error: teamDeleteError } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (teamDeleteError) {
      console.error('Error deleting team:', teamDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      );
    }

    console.log(`Team "${team.name}" (${teamId}) deleted by admin ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Team "${team.name}" has been permanently deleted`
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/teams/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}