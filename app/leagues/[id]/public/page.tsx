import { supabaseAdmin } from '@/lib/supabase-server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function LeaguePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  // Fetch league with public settings
  const { data: league, error } = await supabaseAdmin
    .from('leagues')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">League Not Found</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Fetch standings if public
  let standings = null;
  if (league.is_public) {
    const { data } = await supabaseAdmin
      .from('league_teams')
      .select(`
        team:teams(
          id,
          name,
          team_members(
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
    standings = data;
  }

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

  // Fetch matches/schedule for this league
  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select(`
      *,
      course:courses(id, name),
      team1:teams!matches_team1_id_fkey(id, name),
      team2:teams!matches_team2_id_fkey(id, name)
    `)
    .eq('league_id', id)
    .order('match_date', { ascending: true });

  // Check if current user is a league admin or site admin
  let isAdmin = false;
  let userTeams: any[] = [];
  if (session) {
    const userId = session.user.sub;

    // Check if user is site admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_site_admin')
      .eq('id', userId)
      .single();

    const isSiteAdmin = profile?.is_site_admin || false;

    // Check if user is league admin
    const { data: membership } = await supabaseAdmin
      .from('league_members')
      .select('role')
      .eq('league_id', id)
      .eq('user_id', userId)
      .single();

    const isLeagueAdmin = membership?.role === 'league_admin';
    isAdmin = isLeagueAdmin || isSiteAdmin;

    // Get user's teams where they are captain
    const { data: captainTeams } = await supabaseAdmin
      .from('teams')
      .select('id, name')
      .eq('captain_id', userId)
      .eq('is_active', true);

    userTeams = captainTeams || [];
  }

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    archived: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="flex gap-4 text-sm mb-6">
            <Link href="/dashboard" className="text-blue-100 hover:text-white">
              ← Dashboard
            </Link>
            <span className="text-blue-300">|</span>
            <Link href="/leagues" className="text-blue-100 hover:text-white">
              All Leagues
            </Link>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-4">⛳</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{league.name}</h1>
            {league.description && (
              <p className="text-xl text-blue-100 mb-6">{league.description}</p>
            )}
            <div className="flex justify-center gap-4 items-center">
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  statusColors[league.status as keyof typeof statusColors]
                }`}
              >
                {league.status.toUpperCase()}
              </span>
              {league.registration_open && (
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-yellow-400 text-yellow-900">
                  REGISTRATION OPEN
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Announcements */}
            {announcements && announcements.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Announcements</h2>
                <div className="space-y-4">
                  {announcements.map((announcement: any) => (
                    <div
                      key={announcement.id}
                      className={`p-4 rounded-lg border ${
                        announcement.pinned
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{announcement.title}</h3>
                            {announcement.pinned && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded">
                                PINNED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(announcement.created_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* League Information */}
            {league.league_info && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the League</h2>
                <div className="prose prose-blue max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{league.league_info}</p>
                </div>
              </div>
            )}

            {/* Season Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Season Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(league.start_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {league.end_date && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(league.end_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
                {league.day_of_week && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">League Day</p>
                    <p className="font-semibold text-gray-900">{league.day_of_week}</p>
                  </div>
                )}
                {league.time_of_day && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">League Time</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(`2000-01-01T${league.time_of_day}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Teams */}
            {league.is_public && standings && standings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Teams ({standings.length})
                </h2>
                <div className="space-y-4">
                  {standings.map((item: any) => (
                    <div
                      key={item.team.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <Link
                        href={`/teams/${item.team.id}`}
                        className="font-bold text-lg text-blue-600 hover:text-blue-800 mb-2 block"
                      >
                        {item.team.name}
                      </Link>
                      {item.team.team_members && item.team.team_members.length > 0 ? (
                        <div className="space-y-1 mt-2">
                          <p className="text-xs font-semibold text-gray-600 uppercase">Members:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.team.team_members.map((member: any) => (
                              <Link
                                key={member.user.id}
                                href={`/profile/${member.user.id}`}
                                className="text-sm text-gray-700 hover:text-blue-600 px-2 py-1 bg-white rounded border border-gray-300 hover:border-blue-500"
                              >
                                {member.user.display_name || member.user.name || member.user.email}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2">No members yet</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            {matches && matches.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Schedule ({matches.length} matches)
                </h2>
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
                              <h3 className="text-lg font-bold text-gray-900">
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
                              <div className="text-sm text-gray-600 mt-1">
                                {weekDate && new Date(weekDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                {course && ` • ${course.name}`}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {weekMatches.length} {weekMatches.length === 1 ? 'match' : 'matches'}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-3">
                            {weekMatches.map((match: any) => (
                              <div
                                key={match.id}
                                className="block p-3 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {match.team1?.name} vs {match.team2?.name}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                      match.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : match.status === 'in_progress'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {match.status === 'scheduled' ? 'Scheduled' :
                                     match.status === 'in_progress' ? 'Live' : 'Final'}
                                  </span>
                                </div>
                                {match.status === 'completed' && match.team1_points !== null && (
                                  <div className="text-sm font-bold text-gray-900">
                                    {match.team1_points} - {match.team2_points}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  {match.holes_to_play === 9 && `9 Holes (${match.nine_selection === 'front' ? 'Front' : 'Back'}) • `}
                                  {match.tee_selection} Tees
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Rules & Guidelines */}
            {league.custom_rules && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Rules & Guidelines</h2>
                <div className="prose prose-blue max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{league.custom_rules}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Registration */}
            {league.registration_open && league.registration_info && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Join Our League!</h3>
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="whitespace-pre-wrap text-gray-700">{league.registration_info}</p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(league.contact_name || league.contact_email || league.contact_phone) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
                <div className="space-y-3">
                  {league.contact_name && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                      <p className="font-semibold text-gray-900">{league.contact_name}</p>
                    </div>
                  )}
                  {league.contact_email && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${league.contact_email}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {league.contact_email}
                      </a>
                    </div>
                  )}
                  {league.contact_phone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <a
                        href={`tel:${league.contact_phone}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {league.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {isAdmin && (
                  <Link
                    href={`/leagues/${id}`}
                    className="block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-center"
                  >
                    Manage League
                  </Link>
                )}
                {session && userTeams.length > 0 && !isAdmin && (
                  <Link
                    href={`/leagues/${id}/join-request`}
                    className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-center"
                  >
                    Request to Join
                  </Link>
                )}
                {league.is_public && (
                  <Link
                    href={`/standings?league_id=${id}`}
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-center"
                  >
                    View Standings
                  </Link>
                )}
                {session && (
                  <Link
                    href="/profile/edit"
                    className="block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold text-center"
                  >
                    My Profile
                  </Link>
                )}
                {!session && (
                  <Link
                    href="/api/auth/login"
                    className="block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-center"
                  >
                    Member Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} {league.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
