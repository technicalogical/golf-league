import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  const user = session.user;
  const userId = user.sub;

  // Fetch user profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('profile_completed, display_name, name, email')
    .eq('id', userId)
    .single();

  // Redirect to welcome page if onboarding not completed
  if (!profile?.profile_completed) {
    redirect('/welcome');
  }

  // Determine display name
  const displayName = profile?.display_name || profile?.name || user.name || user.email;

  // Fetch user's leagues with teams and announcement counts
  const { data: userLeagues } = await supabaseAdmin
    .from('league_members')
    .select(`
      *,
      league:leagues(
        id,
        name,
        description,
        status,
        start_date,
        end_date,
        league_day,
        league_time,
        is_public
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get player data for upcoming matches
  const { data: playerData } = await supabaseAdmin
    .from('players')
    .select('id, team_id')
    .eq('user_id', userId)
    .single();

  let upcomingMatch: any = null;

  if (playerData) {
    // Get next upcoming match
    const { data: upcomingMatchData } = await supabaseAdmin
      .from('matches')
      .select(`
        id,
        match_date,
        team1_id,
        team2_id,
        team1:teams!matches_team1_id_fkey(id, name),
        team2:teams!matches_team2_id_fkey(id, name),
        course:courses(id, name),
        league:leagues(id, name)
      `)
      .eq('status', 'scheduled')
      .or(`team1_id.eq.${playerData.team_id},team2_id.eq.${playerData.team_id}`)
      .gte('match_date', new Date().toISOString())
      .order('match_date', { ascending: true })
      .limit(1)
      .single();

    upcomingMatch = upcomingMatchData;
  }

  // Get recent league announcements
  const leagueIds = userLeagues?.map((l: any) => l.league.id) || [];
  let recentAnnouncements: any[] = [];

  if (leagueIds.length > 0) {
    const { data: announcements } = await supabaseAdmin
      .from('league_announcements')
      .select(`
        id,
        title,
        content,
        created_at,
        league:leagues(id, name)
      `)
      .in('league_id', leagueIds)
      .order('created_at', { ascending: false })
      .limit(5);

    recentAnnouncements = announcements || [];
  }

  // Fetch featured public leagues if user has no leagues
  let featuredLeagues = [];
  if (!userLeagues || userLeagues.length === 0) {
    const { data: publicLeagues } = await supabaseAdmin
      .from('leagues')
      .select('id, name, description, status, start_date, end_date')
      .eq('is_public', true)
      .eq('registration_open', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (publicLeagues) {
      featuredLeagues = await Promise.all(
        publicLeagues.map(async (league) => {
          const { count: teamCount } = await supabaseAdmin
            .from('league_teams')
            .select('*', { count: 'exact', head: true })
            .eq('league_id', league.id);

          return {
            ...league,
            teamCount: teamCount || 0,
          };
        })
      );
    }
  }

  // For each league, get the user's teams, next match, and standings
  const leaguesWithTeams = await Promise.all(
    (userLeagues || []).map(async (membership: any) => {
      // Get teams in this league that the user is a member of
      const { data: leagueTeams } = await supabaseAdmin
        .from('league_teams')
        .select(`
          team_id,
          teams!inner(
            id,
            name,
            is_active,
            captain_id
          )
        `)
        .eq('league_id', membership.league.id);

      const teamIds = leagueTeams?.map((lt: any) => lt.teams.id) || [];
      const { data: userTeamMemberships } = await supabaseAdmin
        .from('team_members')
        .select(`
          *,
          team:teams(id, name, is_active, captain_id)
        `)
        .eq('user_id', userId)
        .in('team_id', teamIds);

      // Get user's team ID in this league
      const userTeamInLeague = userTeamMemberships?.[0]?.team;

      // Get next match for user's team in this league
      let nextMatch = null;
      if (userTeamInLeague) {
        const { data: nextMatchData } = await supabaseAdmin
          .from('matches')
          .select(`
            id,
            match_date,
            team1_id,
            team2_id,
            team1:teams!matches_team1_id_fkey(id, name),
            team2:teams!matches_team2_id_fkey(id, name)
          `)
          .eq('league_id', membership.league.id)
          .eq('status', 'scheduled')
          .or(`team1_id.eq.${userTeamInLeague.id},team2_id.eq.${userTeamInLeague.id}`)
          .gte('match_date', new Date().toISOString())
          .order('match_date', { ascending: true })
          .limit(1)
          .single();

        nextMatch = nextMatchData;
      }

      // Get team standings for this league
      const { data: standings } = await supabaseAdmin
        .from('team_standings')
        .select('team_id, rank, points, wins, losses')
        .eq('league_id', membership.league.id)
        .order('rank', { ascending: true })
        .limit(5);

      // Get user's team standing
      const userTeamStanding = standings?.find(s => s.team_id === userTeamInLeague?.id);

      // Get unread announcement count
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('updated_at')
        .eq('id', userId)
        .single();

      const { count: unreadCount } = await supabaseAdmin
        .from('league_announcements')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', membership.league.id)
        .gte('created_at', profile?.updated_at || new Date(0).toISOString());

      return {
        ...membership,
        teams: userTeamMemberships || [],
        unreadAnnouncements: unreadCount || 0,
        nextMatch,
        userTeamStanding,
        userTeam: userTeamInLeague,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Compact Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {displayName}!</h1>
        </div>

        {/* Primary CTA - Enter Scores */}
        {upcomingMatch && playerData && (() => {
          const matchDate = new Date(upcomingMatch.match_date);
          const today = new Date();
          const daysUntilMatch = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilMatch <= 7 && daysUntilMatch >= 0) {
            const isToday = daysUntilMatch === 0;
            const isTomorrow = daysUntilMatch === 1;

            let dateLabel = '';
            if (isToday) {
              dateLabel = 'TODAY';
            } else if (isTomorrow) {
              dateLabel = 'TOMORROW';
            } else {
              dateLabel = `IN ${daysUntilMatch} DAYS`;
            }

            const timeString = matchDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });

            const userTeamId = playerData.team_id;
            const opponentTeam = upcomingMatch.team1_id === userTeamId ? upcomingMatch.team2 : upcomingMatch.team1;
            const userTeam = upcomingMatch.team1_id === userTeamId ? upcomingMatch.team1 : upcomingMatch.team2;

            return (
              <Card className={`mb-8 border-2 ${
                isToday
                  ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-500 dark:border-red-600'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-500 dark:border-blue-600'
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">⚡</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={isToday ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}>
                              {dateLabel}
                            </Badge>
                            <h3 className="text-xl font-bold">Upcoming Match</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {matchDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })} at {timeString}
                          </p>
                        </div>
                      </div>

                      <div className="ml-11 mt-3">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-lg font-bold">{userTeam?.name}</span>
                          <span className="text-muted-foreground font-semibold">vs</span>
                          <span className="text-lg font-bold">{opponentTeam?.name}</span>
                        </div>
                        {upcomingMatch.course && (
                          <p className="text-sm text-muted-foreground">
                            📍 {upcomingMatch.course.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" asChild>
                        <Link href={`/matches/${upcomingMatch.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button className={isToday ? 'bg-red-600 hover:bg-red-700' : ''} asChild>
                        <Link href={`/matches/${upcomingMatch.id}/scorecard`}>
                          Enter Scores
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
        })()}

        {/* My Leagues */}
        {leaguesWithTeams && leaguesWithTeams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Leagues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaguesWithTeams.map((membership: any) => {
                const league = membership.league;
                const isAdmin = membership.role === 'admin';

                return (
                  <Card key={membership.id} className="overflow-hidden">
                    {/* League Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold">{league.name}</h4>
                            {membership.unreadAnnouncements > 0 && (
                              <Badge className="bg-red-500">
                                {membership.unreadAnnouncements}
                              </Badge>
                            )}
                            {isAdmin && (
                              <Badge className="bg-yellow-400 text-yellow-900">ADMIN</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant={league.status === 'active' ? 'default' : 'secondary'} className="bg-white/20">
                              {league.status}
                            </Badge>
                            {league.league_day && (
                              <span className="text-blue-100">
                                {league.league_day}s{league.league_time && ` ${league.league_time.slice(0, 5)}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/leagues/${league.id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <CardContent className="pt-4 space-y-3">
                      {/* Teams */}
                      {membership.teams && membership.teams.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {membership.teams.map((teamMembership: any) => {
                            const isCaptain = teamMembership.team.captain_id === userId;
                            return (
                              <Badge
                                key={teamMembership.id}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-50"
                                asChild
                              >
                                <Link href={`/teams/${teamMembership.team.id}`}>
                                  {teamMembership.team.name}
                                  {isCaptain && ' ⭐'}
                                </Link>
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No teams yet</p>
                      )}

                      {membership.userTeam && (
                        <>
                          <Separator />

                          {/* Current Standing */}
                          {membership.userTeamStanding && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Current Standing:</span>
                              <Badge variant="secondary" className="font-semibold">
                                #{membership.userTeamStanding.rank} · {membership.userTeamStanding.points} pts
                              </Badge>
                            </div>
                          )}

                          {/* Next Match */}
                          {membership.nextMatch && (() => {
                            const match = membership.nextMatch;
                            const matchDate = new Date(match.match_date);
                            const opponentTeam = match.team1_id === membership.userTeam.id ? match.team2 : match.team1;

                            return (
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground">Next Match:</div>
                                <div className="text-sm">
                                  <div className="font-semibold mb-1">
                                    vs {opponentTeam.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    {matchDate.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <Button size="sm" className="w-full" asChild>
                                    <Link href={`/matches/${match.id}/scorecard`}>
                                      Enter Scorecard
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}

                          {!membership.nextMatch && (
                            <div className="text-xs text-muted-foreground italic">
                              No upcoming matches
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* No Leagues State */}
        {leaguesWithTeams && leaguesWithTeams.length === 0 && featuredLeagues.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Featured Public Leagues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {featuredLeagues.map((league: any) => (
                  <Card key={league.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{league.name}</CardTitle>
                        <Badge variant={league.status === 'active' ? 'default' : 'secondary'}>
                          {league.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {league.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{league.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mb-4">
                        {league.teamCount} {league.teamCount === 1 ? 'team' : 'teams'}
                      </p>
                      <Button className="w-full" size="sm" asChild>
                        <Link href={`/leagues/${league.id}/public`}>
                          View & Join
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - 2 columns on mobile, 4 on desktop */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/leagues">
              <Card className="p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-purple-500 group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏅</div>
                <CardTitle className="text-base mb-1">Leagues</CardTitle>
                <p className="text-xs text-muted-foreground">Manage leagues</p>
              </Card>
            </Link>

            <Link href="/teams/browse">
              <Card className="p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-blue-500 group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔍</div>
                <CardTitle className="text-base mb-1">Browse Teams</CardTitle>
                <p className="text-xs text-muted-foreground">Find open teams</p>
              </Card>
            </Link>

            <Link href="/teams/new">
              <Card className="p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-green-500 group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
                <CardTitle className="text-base mb-1">Create Team</CardTitle>
                <p className="text-xs text-muted-foreground">Start a new team</p>
              </Card>
            </Link>

            <Link href="/teams/join">
              <Card className="p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-orange-500 group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🤝</div>
                <CardTitle className="text-base mb-1">Join with Code</CardTitle>
                <p className="text-xs text-muted-foreground">Enter invite code</p>
              </Card>
            </Link>

            <Link href="/standings">
              <Card className="p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-yellow-500 group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
                <CardTitle className="text-base mb-1">Standings</CardTitle>
                <p className="text-xs text-muted-foreground">View rankings</p>
              </Card>
            </Link>

            <Link href="/matches">
              <Card className="p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-green-500 group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⛳</div>
                <CardTitle className="text-base mb-1">Matches</CardTitle>
                <p className="text-xs text-muted-foreground">View all matches</p>
              </Card>
            </Link>

            <Link href="/matches/history">
              <Card className="p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-indigo-500 group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                <CardTitle className="text-base mb-1">Match History</CardTitle>
                <p className="text-xs text-muted-foreground">View completed</p>
              </Card>
            </Link>

            <Link href="/profile/edit">
              <Card className="p-5 hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-gray-500 group text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👤</div>
                <CardTitle className="text-base mb-1">Your Profile</CardTitle>
                <p className="text-xs text-muted-foreground">Edit profile</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Announcements */}
        {recentAnnouncements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📢</span> League Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAnnouncements.map((announcement: any) => (
                  <Link
                    key={announcement.id}
                    href={`/leagues/${announcement.league.id}`}
                    className="block p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold line-clamp-1">{announcement.title}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{announcement.content}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className="text-muted-foreground">{announcement.league.name}</span>
                      <span className="text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
