import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET - Fetch all announcements for a league
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params;

    // Fetch announcements
    const { data: announcements, error } = await supabaseAdmin
      .from('league_announcements')
      .select(`
        *,
        author:profiles!league_announcements_created_by_fkey(
          id,
          name,
          display_name
        )
      `)
      .eq('league_id', leagueId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      );
    }

    return NextResponse.json(announcements || []);
  } catch (error: any) {
    console.error('Error in GET /api/leagues/[id]/announcements:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new announcement
export async function POST(
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
        { error: 'Forbidden: Only league admins and site admins can create announcements' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, pinned } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create announcement
    const { data: announcement, error } = await supabaseAdmin
      .from('league_announcements')
      .insert({
        league_id: leagueId,
        title,
        content,
        pinned: pinned || false,
        created_by: userId,
      })
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
      console.error('Error creating announcement:', error);
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error: any) {
    console.error('Error in POST /api/leagues/[id]/announcements:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
