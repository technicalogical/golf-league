import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-server';

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

  // Determine display name: prioritize profile display_name, fallback to name, then SSO name, then email
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

  // For each league, get the user's teams
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

      // Filter to only teams the user is a member of
      const teamIds = leagueTeams?.map((lt: any) => lt.teams.id) || [];
      const { data: userTeamMemberships } = await supabaseAdmin
        .from('team_members')
        .select(`
          *,
          team:teams(id, name, is_active, captain_id)
        `)
        .eq('user_id', userId)
        .in('team_id', teamIds);

      // Get unread announcement count (announcements created after user last viewed)
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
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logout */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Golf League Dashboard</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/profile/edit"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                {displayName}
              </Link>
              <form action="/api/auth/logout" method="get">
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {displayName}!</h2>
          <p className="text-gray-600">
            Manage your golf league, enter scores, and track your standings.
          </p>
        </div>

        {/* My Leagues */}
        {leaguesWithTeams && leaguesWithTeams.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">My Leagues</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {leaguesWithTeams.map((membership: any) => {
                const league = membership.league;
                const isAdmin = membership.role === 'admin';

                return (
                  <div key={membership.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {/* League Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold">{league.name}</h4>
                            {membership.unreadAnnouncements > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                {membership.unreadAnnouncements}
                              </span>
                            )}
                            {isAdmin && (
                              <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded text-xs font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs">
                            <span className={`px-1.5 py-0.5 rounded font-semibold ${
                              league.status === 'active'
                                ? 'bg-green-400 text-green-900'
                                : 'bg-gray-400 text-gray-900'
                            }`}>
                              {league.status}
                            </span>
                            {league.league_day && (
                              <span className="text-blue-100">
                                {league.league_day}s{league.league_time && ` ${league.league_time.slice(0, 5)}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/leagues/${league.id}`}
                          className="ml-3 px-3 py-1.5 bg-white text-blue-700 rounded hover:bg-blue-50 font-semibold text-xs whitespace-nowrap transition-colors"
                        >
                          View →
                        </Link>
                      </div>
                    </div>

                    {/* Teams Section */}
                    <div className="p-3">
                      {membership.teams && membership.teams.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {membership.teams.map((teamMembership: any) => {
                            const isCaptain = teamMembership.team.captain_id === userId;
                            return (
                              <Link
                                key={teamMembership.id}
                                href={`/teams/${teamMembership.team.id}`}
                                className="group inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-sm"
                              >
                                <span className="font-medium text-gray-900 group-hover:text-blue-600">
                                  {teamMembership.team.name}
                                </span>
                                {isCaptain && (
                                  <span className="px-1.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                                    Captain
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs italic">
                          No teams yet
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {leaguesWithTeams && leaguesWithTeams.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8 text-center">
            <div className="text-4xl mb-4">🏌️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leagues Yet</h3>
            <p className="text-gray-600 mb-4">
              You're not a member of any leagues. Browse public leagues or create your own!
            </p>
            <Link
              href="/leagues"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Browse Leagues
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/leagues"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🏅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Leagues</h3>
            <p className="text-gray-600">
              Manage leagues and seasons
            </p>
          </Link>

          <Link
            href="/teams/new"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Team</h3>
            <p className="text-gray-600">
              Start a new team
            </p>
          </Link>

          <Link
            href="/teams/browse"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Teams</h3>
            <p className="text-gray-600">
              Find open teams
            </p>
          </Link>

          <Link
            href="/teams/join"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Join with Code</h3>
            <p className="text-gray-600">
              Enter an invite code
            </p>
          </Link>

          <Link
            href="/matches"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">⛳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Scores</h3>
            <p className="text-gray-600">
              Record match results and calculate points
            </p>
          </Link>

          <Link
            href="/standings"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">View Standings</h3>
            <p className="text-gray-600">
              Check team and player rankings
            </p>
          </Link>

          <Link
            href="/matches/history"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Match History</h3>
            <p className="text-gray-600">
              View completed matches
            </p>
          </Link>

          <Link
            href="/profile/edit"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Profile</h3>
            <p className="text-gray-600">
              View and edit your profile
            </p>
          </Link>
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-500 text-center py-8">
            No recent activity to display. Start by entering match scores!
          </p>
        </div>
      </main>
    </div>
  );
}
