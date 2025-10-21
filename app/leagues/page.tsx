import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function LeaguesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  const userId = session.user.sub;

  // Fetch leagues where user is a member
  const { data: memberLeagues } = await supabaseAdmin
    .from('league_members')
    .select(`
      role,
      league:leagues(
        id,
        name,
        description,
        start_date,
        end_date,
        status
      )
    `)
    .eq('user_id', userId);

  // Fetch all leagues (for discovery)
  const { data: allLeagues } = await supabaseAdmin
    .from('leagues')
    .select('*')
    .order('created_at', { ascending: false });

  // Add team and match counts to leagues
  const myLeaguesWithCounts = await Promise.all(
    (memberLeagues || []).map(async (ml: any) => {
      const league = ml.league;

      const { count: teamCount } = await supabaseAdmin
        .from('league_teams')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id);

      const { count: matchCount } = await supabaseAdmin
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', league.id);

      return {
        ...league,
        role: ml.role,
        teamCount: teamCount || 0,
        matchCount: matchCount || 0,
      };
    })
  );

  const otherLeaguesWithCounts = await Promise.all(
    (allLeagues || [])
      .filter((l) => !memberLeagues?.find((ml: any) => ml.league.id === l.id))
      .map(async (league: any) => {
        const { count: teamCount } = await supabaseAdmin
          .from('league_teams')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', league.id);

        const { count: matchCount } = await supabaseAdmin
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', league.id);

        return {
          ...league,
          teamCount: teamCount || 0,
          matchCount: matchCount || 0,
        };
      })
  );

  const myLeagues = myLeaguesWithCounts;
  const otherLeagues = otherLeaguesWithCounts;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Leagues</h1>
            <Link
              href="/leagues/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create League
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* My Leagues */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Leagues</h2>
          {myLeagues.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              You are not a member of any leagues yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myLeagues.map((league: any) => (
                <Link
                  key={league.id}
                  href={`/leagues/${league.id}/public`}
                  className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{league.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        league.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : league.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {league.status}
                    </span>
                  </div>
                  {league.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{league.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">👥</span>
                      <span>{league.teamCount} {league.teamCount === 1 ? 'team' : 'teams'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">⛳</span>
                      <span>{league.matchCount} {league.matchCount === 1 ? 'match' : 'matches'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t border-gray-200">
                    <span>
                      {new Date(league.start_date).toLocaleDateString()}
                      {league.end_date && ` - ${new Date(league.end_date).toLocaleDateString()}`}
                    </span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {league.role.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Other Leagues */}
        {otherLeagues.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Leagues</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherLeagues.map((league: any) => (
                <div
                  key={league.id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{league.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        league.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : league.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {league.status}
                    </span>
                  </div>
                  {league.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{league.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">👥</span>
                      <span>{league.teamCount} {league.teamCount === 1 ? 'team' : 'teams'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">⛳</span>
                      <span>{league.matchCount} {league.matchCount === 1 ? 'match' : 'matches'}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-4 pt-3 border-t border-gray-200">
                    {new Date(league.start_date).toLocaleDateString()}
                    {league.end_date && ` - ${new Date(league.end_date).toLocaleDateString()}`}
                  </div>
                  <Link
                    href={`/leagues/${league.id}/public`}
                    className="block text-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
