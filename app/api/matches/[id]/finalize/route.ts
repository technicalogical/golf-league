import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: matchId } = await params;

    // Get match data
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('*, team1:teams!matches_team1_id_fkey(id, name), team2:teams!matches_team2_id_fkey(id, name)')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check if already completed
    if (match.status === 'completed') {
      return NextResponse.json({ error: 'Match is already finalized' }, { status: 400 });
    }

    // Check authorization: user must be a team member OR a league admin
    const { data: team1Members } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('team_id', match.team1_id);

    const { data: team2Members } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('team_id', match.team2_id);

    const team1MemberIds = team1Members?.map(tm => tm.user_id) || [];
    const team2MemberIds = team2Members?.map(tm => tm.user_id) || [];
    const allTeamMemberIds = [...team1MemberIds, ...team2MemberIds];

    const isTeamMember = allTeamMemberIds.includes(userId);

    // Check if user is a league admin
    let isLeagueAdmin = false;
    if (match.league_id) {
      const { data: membership } = await supabaseAdmin
        .from('league_members')
        .select('role')
        .eq('league_id', match.league_id)
        .eq('user_id', userId)
        .single();

      isLeagueAdmin = membership?.role === 'league_admin';
    }

    if (!isTeamMember && !isLeagueAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only team members and league admins can finalize matches' },
        { status: 403 }
      );
    }

    // Get all scorecards to verify all scores are entered
    const { data: scorecards } = await supabaseAdmin
      .from('scorecards')
      .select('*, hole_scores(count)')
      .eq('match_id', matchId);

    // Get expected holes count
    const { data: courseHoles } = await supabaseAdmin
      .from('holes')
      .select('id')
      .eq('course_id', match.course_id);

    const holesCount = match.holes_to_play || 18;

    // Check if all players have all scores
    const allComplete = scorecards?.every((sc: any) => {
      return sc.hole_scores?.[0]?.count >= holesCount;
    });

    if (!allComplete) {
      return NextResponse.json(
        { error: 'Cannot finalize: Not all scores are entered. Please ensure all players have completed their scorecards.' },
        { status: 400 }
      );
    }

    // Check if match results have been calculated (team points should not be null)
    if (match.team1_points === null || match.team2_points === null) {
      return NextResponse.json(
        { error: 'Cannot finalize: Match results have not been calculated yet. Please ensure scores are properly submitted.' },
        { status: 400 }
      );
    }

    // Mark match as completed
    await supabaseAdmin
      .from('matches')
      .update({ status: 'completed' })
      .eq('id', matchId);

    // Create notifications for all players
    const playerIds = [...team1MemberIds, ...team2MemberIds];
    const notifications = [];

    // Notification for the person who finalized
    notifications.push({
      user_id: userId,
      type: 'match_finalized',
      title: 'Match Finalized',
      message: `You finalized the match between ${match.team1?.name} and ${match.team2?.name}`,
      match_id: matchId,
    });

    // Notifications for other players
    for (const playerId of playerIds) {
      if (playerId !== userId) {
        notifications.push({
          user_id: playerId,
          type: 'match_completed',
          title: 'Match Results Available',
          message: `The match between ${match.team1?.name} and ${match.team2?.name} has been finalized`,
          match_id: matchId,
        });
      }
    }

    // Notification for league admin (if exists and different from submitter)
    if (match.league_id) {
      const { data: admins } = await supabaseAdmin
        .from('league_members')
        .select('user_id')
        .eq('league_id', match.league_id)
        .eq('role', 'league_admin');

      for (const admin of admins || []) {
        if (admin.user_id !== userId && !playerIds.includes(admin.user_id)) {
          notifications.push({
            user_id: admin.user_id,
            type: 'match_completed',
            title: 'Match Completed in Your League',
            message: `${match.team1?.name} vs ${match.team2?.name} has been finalized`,
            match_id: matchId,
          });
        }
      }
    }

    // Insert notifications (assuming you have a notifications table)
    // Comment this out if notifications table doesn't exist yet
    try {
      await supabaseAdmin.from('notifications').insert(notifications);
    } catch (notifError) {
      console.error('Failed to create notifications:', notifError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'Match finalized successfully',
    });
  } catch (error: any) {
    console.error('Error finalizing match:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to finalize match' },
      { status: 500 }
    );
  }
}
