import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(
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

    const { id: leagueId, memberId } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['league_admin', 'team_captain', 'player', 'viewer'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user has league_admin role for this league
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'league_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only league admins can update member roles' },
        { status: 403 }
      );
    }

    // Verify member exists in this league
    const { data: existingMember } = await supabaseAdmin
      .from('league_members')
      .select('*')
      .eq('id', memberId)
      .eq('league_id', leagueId)
      .single();

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found in this league' },
        { status: 404 }
      );
    }

    // Prevent removing the last league admin
    if (existingMember.role === 'league_admin' && role !== 'league_admin') {
      const { data: admins } = await supabaseAdmin
        .from('league_members')
        .select('id')
        .eq('league_id', leagueId)
        .eq('role', 'league_admin');

      if (admins && admins.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last league admin. Promote another member first.' },
          { status: 400 }
        );
      }
    }

    // Update member role
    const { data: updatedMember, error: updateError } = await supabaseAdmin
      .from('league_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating member role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update member role' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    console.error('Error in PATCH /api/leagues/[id]/members/[memberId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { id: leagueId, memberId } = await params;

    // Check if user has league_admin role for this league
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!membership || membership.role !== 'league_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only league admins can remove members' },
        { status: 403 }
      );
    }

    // Verify member exists in this league
    const { data: existingMember } = await supabaseAdmin
      .from('league_members')
      .select('*')
      .eq('id', memberId)
      .eq('league_id', leagueId)
      .single();

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Member not found in this league' },
        { status: 404 }
      );
    }

    // Prevent removing the last league admin
    if (existingMember.role === 'league_admin') {
      const { data: admins } = await supabaseAdmin
        .from('league_members')
        .select('id')
        .eq('league_id', leagueId)
        .eq('role', 'league_admin');

      if (admins && admins.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last league admin' },
          { status: 400 }
        );
      }
    }

    // Remove member from league
    const { error: deleteError } = await supabaseAdmin
      .from('league_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('Error removing member from league:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove member from league' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/leagues/[id]/members/[memberId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
