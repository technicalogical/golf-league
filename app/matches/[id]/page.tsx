import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/api/auth/login');
  }

  const { id } = await params;

  // Fetch match with all related data
  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      *,
      team1:team1_id(
        id,
        name,
        players(id, name, handicap, is_active)
      ),
      team2:team2_id(
        id,
        name,
        players(id, name, handicap, is_active)
      ),
      course:courses(
        id,
        name,
        par,
        location,
        holes(hole_number, par, handicap_index, yardage)
      ),
      scorecards(
        id,
        player_id,
        total_score,
        player:players(id, name, handicap)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Match Not Found</h1>
          <Link href="/matches" className="text-blue-600 hover:text-blue-800">
            ← Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  };

  const statusLabels = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  const team1Players = match.team1?.players || [];
  const team2Players = match.team2?.players || [];
  const canStartMatch = team1Players.length === 2 && team2Players.length === 2;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Matches
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Match Details</h1>
            <span className={`px-3 py-1 text-sm rounded-full font-semibold ${statusColors[match.status as keyof typeof statusColors]}`}>
              {statusLabels[match.status as keyof typeof statusLabels]}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Match Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teams */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Teams</h2>

              <div className="space-y-6">
                {/* Team 1 */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{match.team1?.name}</h3>
                    {match.status === 'completed' && match.team1_points !== null && (
                      <span className="text-3xl font-bold text-blue-600">{match.team1_points}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {team1Players.map((player: any) => (
                      <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{player.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Handicap: {player.handicap}</span>
                      </div>
                    ))}
                    {team1Players.length === 0 && (
                      <p className="text-gray-500 text-sm">No players assigned</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Team 2 */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{match.team2?.name}</h3>
                    {match.status === 'completed' && match.team2_points !== null && (
                      <span className="text-3xl font-bold text-blue-600">{match.team2_points}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {team2Players.map((player: any) => (
                      <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{player.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Handicap: {player.handicap}</span>
                      </div>
                    ))}
                    {team2Players.length === 0 && (
                      <p className="text-gray-500 text-sm">No players assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {!canStartMatch && match.status === 'scheduled' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      Both teams must have exactly 2 players before the match can start.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {match.status === 'scheduled' && (
                    <Link
                      href={`/matches/${match.id}/edit`}
                      className="block w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-center"
                    >
                      Edit Match Settings
                    </Link>
                  )}

                  {match.status === 'scheduled' && canStartMatch && (
                    <Link
                      href={`/matches/${match.id}/scorecard`}
                      className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-center"
                    >
                      Start Match & Enter Scores
                    </Link>
                  )}

                  {match.status === 'in_progress' && (
                    <Link
                      href={`/matches/${match.id}/scorecard`}
                      className="block w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold text-center"
                    >
                      Continue Entering Scores
                    </Link>
                  )}

                  {match.status === 'completed' && (
                    <Link
                      href={`/matches/${match.id}/scorecard`}
                      className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-center"
                    >
                      View Scorecard
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">Date:</span>
                  <div className="text-gray-600 mt-1">
                    {new Date(match.match_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Course:</span>
                  <div className="text-gray-600 mt-1">{match.course?.name}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    Par {match.course?.par} • {match.course?.location}
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Status:</span>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${statusColors[match.status as keyof typeof statusColors]}`}>
                      {statusLabels[match.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
