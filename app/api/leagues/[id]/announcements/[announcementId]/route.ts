import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

// PATCH - Update an announcement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; announcementId: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leagueId, announcementId } = await params;

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
        { error: 'Forbidden: Only league admins and site admins can update announcements' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, pinned } = body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (pinned !== undefined) updates.pinned = pinned;

    // Update announcement
    const { data: announcement, error } = await supabaseAdmin
      .from('league_announcements')
      .update(updates)
      .eq('id', announcementId)
      .eq('league_id', leagueId)
      .select(`
        *,
        author:profiles!league_announcements_created_by_fkey(
          id,
          name,
          display_name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      return NextResponse.json(
        { error: 'Failed to update announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error: any) {
    console.error('Error in PATCH /api/leagues/[id]/announcements/[announcementId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; announcementId: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leagueId, announcementId } = await params;

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
        { error: 'Forbidden: Only league admins and site admins can delete announcements' },
        { status: 403 }
      );
    }

    // Delete announcement
    const { error } = await supabaseAdmin
      .from('league_announcements')
      .delete()
      .eq('id', announcementId)
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error deleting announcement:', error);
      return NextResponse.json(
        { error: 'Failed to delete announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/leagues/[id]/announcements/[announcementId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
