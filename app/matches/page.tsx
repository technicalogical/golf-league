import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-server';

export default async function MatchesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  const userId = session.user.sub;

  // Fetch user's teams
  const { data: userTeams } = await supabaseAdmin
    .from('team_members')
    .select('team_id, team:teams(id, name)')
    .eq('user_id', userId);

  const teamIds = userTeams?.map(tm => tm.team_id) || [];

  // Fetch leagues where user's teams are participating
  const { data: leagueTeams } = await supabaseAdmin
    .from('league_teams')
    .select(`
      league_id,
      league:leagues(
        id,
        name,
        status,
        start_date,
        end_date
      )
    `)
    .in('team_id', teamIds);

  // Get unique leagues
  const leagues = leagueTeams?.reduce((acc: any[], lt: any) => {
    if (!acc.find(l => l.id === lt.league.id)) {
      acc.push(lt.league);
    }
    return acc;
  }, []) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Scores</h1>
          <p className="text-gray-600 mt-1">Select a league to view your matches</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {leagues.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🏌️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Leagues</h2>
            <p className="text-gray-600 mb-6">
              You're not currently part of any team in an active league.
            </p>
            <Link
              href="/teams/browse"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Browse Teams
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league: any) => (
              <Link
                key={league.id}
                href={`/matches/league/${league.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{league.name}</h3>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      league.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : league.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800'
                    }`}
                  >
                    {league.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-semibold">Started:</span>{' '}
                    {new Date(league.start_date).toLocaleDateString()}
                  </div>
                  {league.end_date && (
                    <div>
                      <span className="font-semibold">Ends:</span>{' '}
                      {new Date(league.end_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                    View My Matches →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
