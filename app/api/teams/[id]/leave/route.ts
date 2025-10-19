import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

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

    const { id: teamId } = await params;

    // Get current member status
    const { data: member } = await supabaseAdmin
      .from('team_members')
      .select('is_captain')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: 'You are not a member of this team' },
        { status: 404 }
      );
    }

    // Cannot leave if captain
    if (member.is_captain) {
      return NextResponse.json(
        { error: 'Team captain cannot leave. Transfer captaincy or delete the team first.' },
        { status: 403 }
      );
    }

    // Remove member
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error leaving team:', error);
      return NextResponse.json(
        { error: 'Failed to leave team' },
        { status: 500 }
      );
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error: any) {
    console.error('Error in POST /api/teams/[id]/leave:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
