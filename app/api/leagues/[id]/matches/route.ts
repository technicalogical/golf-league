import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await params;

    // Fetch all matches for this league
    const { data: matches, error } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        team1:teams!matches_team1_id_fkey(id, name),
        team2:teams!matches_team2_id_fkey(id, name),
        course:courses(id, name, par, location)
      `)
      .eq('league_id', leagueId)
      .order('week_number', { ascending: true })
      .order('match_date', { ascending: true });

    if (error) {
      console.error('Error fetching league matches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch league matches' },
        { status: 500 }
      );
    }

    return NextResponse.json(matches || []);
  } catch (error: any) {
    console.error('Error in GET /api/leagues/[id]/matches:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
