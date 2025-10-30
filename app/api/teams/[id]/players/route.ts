import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    // Get all players for this team
    const { data: players, error } = await supabaseAdmin
      .from('players')
      .select('id, name, handicap, team_id, is_active, user_id')
      .eq('team_id', teamId)
      .order('name');

    if (error) {
      console.error('Error fetching team players:', error);
      return NextResponse.json(
        { error: 'Failed to fetch team players' },
        { status: 500 }
      );
    }

    return NextResponse.json(players || []);
  } catch (error: any) {
    console.error('Error in GET /api/teams/[id]/players:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
