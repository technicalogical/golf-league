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

    // Check if user is a league admin
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!membership || (membership.role !== 'admin' && membership.role !== 'league_admin')) {
      return NextResponse.json(
        { error: 'Only league admins can delete leagues' },
        { status: 403 }
      );
    }

    // Delete the league (cascade will handle related records)
    const { error: deleteError } = await supabaseAdmin
      .from('leagues')
      .delete()
      .eq('id', leagueId);

    if (deleteError) {
      console.error('Error deleting league:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete league' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'League deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/leagues/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
