import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: teamId, memberId } = await params;

    // Get the member to be removed
    const { data: memberToRemove } = await supabaseAdmin
      .from('team_members')
      .select('user_id, is_captain')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single();

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if user is the captain or removing themselves
    const { data: currentMember } = await supabaseAdmin
      .from('team_members')
      .select('is_captain')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    const isCaptain = currentMember?.is_captain || false;
    const isSelf = memberToRemove.user_id === userId;

    // Cannot remove captain
    if (memberToRemove.is_captain) {
      return NextResponse.json(
        { error: 'Cannot remove team captain' },
        { status: 403 }
      );
    }

    // Must be captain or removing self
    if (!isCaptain && !isSelf) {
      return NextResponse.json(
        { error: 'Only team captain can remove members' },
        { status: 403 }
      );
    }

    // Remove the member
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', teamId);

    if (error) {
      console.error('Error removing team member:', error);
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/teams/[id]/members/[memberId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
