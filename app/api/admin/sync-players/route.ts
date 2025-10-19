import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const session = await getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let playersCreated = 0;
    let playersSkipped = 0;
    let leagueMembersCreated = 0;
    let leagueMembersSkipped = 0;

    // Get all team members with their team and profile info
    const { data: teamMembers } = await supabaseAdmin
      .from('team_members')
      .select(`
        *,
        team:teams(id, name),
        profile:profiles(id, name, display_name, email)
      `);

    if (!teamMembers) {
      return NextResponse.json({ error: 'No team members found' }, { status: 404 });
    }

    // For each team member, check if they have a player record
    for (const tm of teamMembers) {
      // Check if player already exists for this user on this team
      const { data: existingPlayer } = await supabaseAdmin
        .from('players')
        .select('id')
        .eq('team_id', tm.team_id)
        .eq('profile_id', tm.user_id)
        .single();

      if (existingPlayer) {
        playersSkipped++;
      } else {
        // Create player record
        const playerName = tm.profile?.display_name || tm.profile?.name || tm.profile?.email || 'Player';

        const { error: playerError } = await supabaseAdmin
          .from('players')
          .insert({
            team_id: tm.team_id,
            profile_id: tm.user_id,
            name: playerName,
            handicap: 18, // Default handicap, can be updated later
            is_active: true,
          });

        if (playerError) {
          console.error('Error creating player:', playerError);
        } else {
          playersCreated++;
        }
      }
    }

    // Now sync league memberships
    // Get all teams that are in leagues
    const { data: leagueTeams } = await supabaseAdmin
      .from('league_teams')
      .select(`
        league_id,
        team_id
      `);

    if (leagueTeams) {
      // For each league-team combo, add all team members as league members
      for (const lt of leagueTeams) {
        // Get team members for this team
        const { data: members } = await supabaseAdmin
          .from('team_members')
          .select('user_id')
          .eq('team_id', lt.team_id);

        if (members) {
          for (const member of members) {
            // Check if league membership already exists
            const { data: existingMembership } = await supabaseAdmin
              .from('league_members')
              .select('id')
              .eq('league_id', lt.league_id)
              .eq('user_id', member.user_id)
              .single();

            if (existingMembership) {
              leagueMembersSkipped++;
            } else {
              // Create league membership with 'player' role
              const { error: memberError } = await supabaseAdmin
                .from('league_members')
                .insert({
                  league_id: lt.league_id,
                  user_id: member.user_id,
                  role: 'player',
                });

              if (memberError) {
                console.error('Error creating league member:', memberError);
              } else {
                leagueMembersCreated++;
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      playersCreated,
      playersSkipped,
      leagueMembersCreated,
      leagueMembersSkipped,
    });
  } catch (error: any) {
    console.error('Error in sync-players:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
