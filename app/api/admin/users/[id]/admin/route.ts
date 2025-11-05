import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PATCH(
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

    const body = await request.json();
    const { is_site_admin } = body;

    // Prevent user from removing their own admin status
    if (userId === targetUserId && !is_site_admin) {
      return NextResponse.json(
        { error: 'Cannot remove your own admin status' },
        { status: 400 }
      );
    }

    // Update the user's admin status
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_site_admin })
      .eq('id', targetUserId);

    if (error) {
      console.error('Error updating admin status:', error);
      return NextResponse.json(
        { error: 'Failed to update admin status' },
        { status: 500 }
      );
    }

    // Get user info for logging
    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', targetUserId)
      .single();

    console.log(
      `Admin status ${is_site_admin ? 'granted to' : 'revoked from'} ${targetUser?.email} by ${userId}`
    );

    return NextResponse.json({
      success: true,
      message: `Admin status ${is_site_admin ? 'granted' : 'revoked'} successfully`
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/users/[id]/admin:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}