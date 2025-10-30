import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import Link from 'next/link';
import RemoveTeamButton from './RemoveTeamButton';
import DestroyScheduleButton from './DestroyScheduleButton';

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/api/auth/login');
  }

  const { id } = await params;
  const userId = session.user.sub;

  // Fetch league details
  const { data: league } = await supabaseAdmin
    .from('leagues')
    .select('*')
    .eq('id', id)
    .single();

  if (!league) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">League Not Found</h1>
          <Link href="/leagues" className="text-blue-600 hover:text-blue-800">
            ← Back to Leagues
          </Link>
        </div>
      </div>
    );
  }

  // Get user's role in this league
  const { data: membership } = await supabaseAdmin
    .from('league_members')
    .select('role')
    .eq('league_id', id)
    .eq('user_id', userId)
    .single();

  const userRole = membership?.role;
  const isAdmin = userRole === 'league_admin';

  // Fetch league teams with members
  const { data: leagueTeams } = await supabaseAdmin
    .from('league_teams')
    .select(`
      *,
      team:teams(
        id,
        name,
        is_active,
        captain_id,
        team_members(
          id,
          is_captain,
          user:profiles(
            id,
            name,
            display_name,
            email
          )
        )
      )
    `)
    .eq('league_id', id);

  // Fetch league members
  const { data: members } = await supabaseAdmin
    .from('league_members')
    .select(`
      *,
      user:profiles(
        id,
        name,
        display_name,
        email
      )
    `)
    .eq('league_id', id);

  // Fetch matches for this league
  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name),
      team2:teams!matches_team2_id_fkey(id, name)
    `)
    .eq('league_id', id)
    .order('match_date', { ascending: true });

  // Fetch announcements for this league
  const { data: announcements } = await supabaseAdmin
    .from('league_announcements')
    .select(`
      *,
      author:profiles!league_announcements_created_by_fkey(
        id,
        name,
        display_name
      )
    `)
    .eq('league_id', id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex gap-4 text-sm mb-2">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Dashboard
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/leagues" className="text-blue-600 hover:text-blue-800">
              All Leagues
            </Link>
            <span className="text-gray-400">|</span>
            <Link href={`/leagues/${id}/public`} className="text-blue-600 hover:text-blue-800">
              League Profile
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{league.name}</h1>
              {league.description && (
                <p className="text-gray-600 mt-1">{league.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded ${
                  league.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : league.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800'
                }`}
              >
                {league.status}
              </span>
              {userRole && (
                <span className="px-3 py-1 text-sm font-semibold bg-blue-50 text-blue-700 rounded">
                  {userRole.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-6 text-sm text-gray-600 dark:text-gray-300">
            <span>
              <strong>Start:</strong> {new Date(league.start_date).toLocaleDateString()}
            </span>
            {league.end_date && (
              <span>
                <strong>End:</strong> {new Date(league.end_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Action Buttons */}
        <div className="mb-6 space-y-4">
          {/* Quick Actions for all members */}
          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/standings?league_id=${id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              View Standings
            </Link>
            <Link
              href={`/matches/history?league_id=${id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
            >
              Match History
            </Link>
            <Link
              href={`/leagues/${id}/announcements`}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold transition-colors"
            >
              Announcements
            </Link>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-3 uppercase tracking-wide">
                League Administration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <Link
                  href={`/leagues/${id}/schedule`}
                  className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 font-semibold text-center transition-colors"
                >
                  Manage Schedule
                </Link>
                <Link
                  href={`/leagues/${id}/handicaps`}
                  className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 font-semibold text-center transition-colors"
                >
                  Manage Handicaps
                </Link>
                <Link
                  href={`/leagues/${id}/teams/add`}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold text-center transition-colors"
                >
                  Add Teams
                </Link>
                <Link
                  href={`/leagues/${id}/members`}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold text-center transition-colors"
                >
                  Manage Members
                </Link>
                <Link
                  href={`/leagues/${id}/settings`}
                  className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 font-semibold text-center transition-colors"
                >
                  League Settings
                </Link>
              </div>
              <div className="mt-3 flex justify-end">
                <DestroyScheduleButton leagueId={id} />
              </div>
            </div>
          )}
        </div>

        {/* Announcements Section */}
        {announcements && announcements.length > 0 && (
          <section className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Announcements ({announcements.length})
            </h2>
            <div className="space-y-4">
              {announcements.map((announcement: any) => (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-lg border ${
                    announcement.pinned
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">{announcement.title}</h3>
                        {announcement.pinned && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded">
                            PINNED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Posted by {announcement.author?.display_name || announcement.author?.name} on{' '}
                        {new Date(announcement.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{announcement.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Teams Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Teams ({leagueTeams?.length || 0})
            </h2>
            {!leagueTeams || leagueTeams.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No teams in this league yet.</p>
            ) : (
              <div className="space-y-4">
                {leagueTeams.map((lt: any) => (
                  <div key={lt.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Link
                          href={`/teams/${lt.team.id}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {lt.team.name}
                        </Link>
                        {!lt.team.is_active && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Inactive)</span>
                        )}
                      </div>
                      {isAdmin && (
                        <RemoveTeamButton
                          leagueId={id}
                          teamId={lt.team.id}
                          teamName={lt.team.name}
                        />
                      )}
                    </div>
                    {lt.team.team_members && lt.team.team_members.length > 0 && (
                      <div className="space-y-1">
                        {lt.team.team_members.map((tm: any) => (
                          <div key={tm.id} className="flex items-center justify-between text-sm">
                            <Link
                              href={`/profile/${tm.user.id}`}
                              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {tm.user.display_name || tm.user.name || tm.user.email}
                            </Link>
                            {tm.is_captain && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                                Captain
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Members Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Members ({members?.length || 0})
            </h2>
            {!members || members.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No members yet.</p>
            ) : (
              <div className="space-y-2">
                {members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {member.user?.display_name || member.user?.name || member.user?.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{member.user?.email}</div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded">
                      {member.role.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Schedule Section */}
        <section className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Schedule ({matches?.length || 0} matches)
          </h2>
          {!matches || matches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No matches scheduled yet. Generate a schedule to get started!
            </p>
          ) : (
            <div className="space-y-6">
              {(() => {
                // Group matches by week
                const matchesByWeek: { [key: number]: any[] } = {};
                matches.forEach((match: any) => {
                  const week = match.week_number || 0;
                  if (!matchesByWeek[week]) {
                    matchesByWeek[week] = [];
                  }
                  matchesByWeek[week].push(match);
                });

                // Sort weeks
                const sortedWeeks = Object.keys(matchesByWeek)
                  .map(Number)
                  .sort((a, b) => a - b);

                return sortedWeeks.map((weekNum) => {
                  const weekMatches = matchesByWeek[weekNum];
                  const weekDate = weekMatches[0]?.match_date;
                  const allCompleted = weekMatches.every((m: any) => m.status === 'completed');
                  const anyInProgress = weekMatches.some((m: any) => m.status === 'in_progress');
                  const course = weekMatches[0]?.course;

                  return (
                    <div key={weekNum} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Week {weekNum}
                            {allCompleted && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded">
                                Complete
                              </span>
                            )}
                            {anyInProgress && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                                In Progress
                              </span>
                            )}
                          </h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {weekDate && new Date(weekDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {course && ` • ${course.name}`}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {weekMatches.length} {weekMatches.length === 1 ? 'match' : 'matches'}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {weekMatches.map((match: any) => (
                          <Link
                            key={match.id}
                            href={`/matches/${match.id}`}
                            className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {match.team1?.name} vs {match.team2?.name}
                              </div>
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                  match.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : match.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700'
                                }`}
                              >
                                {match.status === 'scheduled' ? 'Scheduled' :
                                 match.status === 'in_progress' ? 'Live' : 'Final'}
                              </span>
                            </div>
                            {match.status === 'completed' && match.team1_points !== null && (
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {match.team1_points} - {match.team2_points}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {match.holes_to_play === 9 && `9 Holes (${match.nine_selection === 'front' ? 'Front' : 'Back'}) • `}
                              {match.tee_selection} Tees
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
