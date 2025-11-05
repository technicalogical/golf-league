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

    const { id: leagueId } = await params;

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
    const { status } = body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Update the league status
    const { data, error } = await supabaseAdmin
      .from('leagues')
      .update({ status })
      .eq('id', leagueId)
      .select('name')
      .single();

    if (error) {
      console.error('Error updating league status:', error);
      return NextResponse.json(
        { error: 'Failed to update league status' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    console.log(`Updated league "${data.name}" status to: ${status}`);

    return NextResponse.json({
      success: true,
      message: `League status updated to ${status}`
    });

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/leagues/[id]/status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}