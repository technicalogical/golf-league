import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leagueId, teamId } = await params;

    // Check if user is league admin or site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    const isSiteAdmin = profile?.is_site_admin || false;

    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    const isLeagueAdmin = membership?.role === 'league_admin';

    if (!isLeagueAdmin && !isSiteAdmin) {
      return NextResponse.json(
        { error: 'Only league admins can remove teams' },
        { status: 403 }
      );
    }

    // Delete the team from the league (cascade will handle matches)
    const { error } = await supabaseAdmin
      .from('league_teams')
      .delete()
      .eq('league_id', leagueId)
      .eq('team_id', teamId);

    if (error) {
      console.error('Error removing team from league:', error);
      return NextResponse.json(
        { error: 'Failed to remove team' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/leagues/[id]/teams/[teamId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
