import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teams where user is captain
    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select('id, name, is_active')
      .eq('captain_id', userId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching captain teams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    }

    return NextResponse.json(teams || []);
  } catch (error: any) {
    console.error('Error in GET /api/teams/my-captain-teams:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
