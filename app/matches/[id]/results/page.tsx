import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function MatchResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/api/auth/login');
  }

  const { id } = await params;

  // Fetch match with all scorecard data
  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      *,
      team1:team1_id(id, name),
      team2:team2_id(id, name),
      course:courses(id, name, par, location),
      scorecards(
        *,
        player:players(id, name),
        hole_scores(
          *,
          hole:holes(hole_number, par, handicap_index)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !match || match.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {match?.status !== 'completed' ? 'Match Not Completed' : 'Match Not Found'}
          </h1>
          <Link href="/matches" className="text-blue-600 hover:text-blue-800">
            ← Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  // Organize scorecards by team
  const team1Scorecards = match.scorecards
    ?.filter((sc: any) =>
      match.scorecards.slice(0, 2).some((t1sc: any) => t1sc.id === sc.id)
    )
    .sort((a: any, b: any) => a.handicap_at_time - b.handicap_at_time);

  const team2Scorecards = match.scorecards
    ?.filter((sc: any) =>
      match.scorecards.slice(2, 4).some((t2sc: any) => t2sc.id === sc.id)
    )
    .sort((a: any, b: any) => a.handicap_at_time - b.handicap_at_time);

  const team1Won = match.team1_points > match.team2_points;
  const team2Won = match.team2_points > match.team1_points;
  const isTie = match.team1_points === match.team2_points;

  // Sort hole scores by hole number
  match.scorecards?.forEach((sc: any) => {
    sc.hole_scores?.sort((a: any, b: any) => a.hole?.hole_number - b.hole?.hole_number);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Matches
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Match Results</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Match Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600 mb-2">
              {new Date(match.match_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{match.course?.name} • Par {match.course?.par}</div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Team 1 */}
            <div className={`text-center ${team1Won ? 'order-1' : 'order-1 md:order-1'}`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{match.team1?.name}</h2>
              <div className={`text-6xl font-bold ${team1Won ? 'text-green-600' : 'text-gray-400'}`}>
                {match.team1_points}
              </div>
              {team1Won && <div className="mt-2 text-green-600 font-semibold">Winner!</div>}
            </div>

            {/* VS */}
            <div className="text-center order-2">
              <div className="text-3xl font-bold text-gray-400">VS</div>
              {isTie && <div className="mt-2 text-blue-600 font-semibold">Tie Match</div>}
            </div>

            {/* Team 2 */}
            <div className={`text-center ${team2Won ? 'order-1 md:order-3' : 'order-3'}`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{match.team2?.name}</h2>
              <div className={`text-6xl font-bold ${team2Won ? 'text-green-600' : 'text-gray-400'}`}>
                {match.team2_points}
              </div>
              {team2Won && <div className="mt-2 text-green-600 font-semibold">Winner!</div>}
            </div>
          </div>
        </div>

        {/* Detailed Scorecard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Scorecard</h2>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 border-y-2 border-gray-300 dark:border-gray-600">
              <tr>
                <th className="p-3 text-left font-semibold">Hole</th>
                <th className="p-3 text-center font-semibold">Par</th>
                <th className="p-3 text-center font-semibold">HCP</th>
                {match.scorecards?.map((sc: any) => (
                  <th key={sc.id} className="p-3 text-center font-semibold">
                    <div>{sc.player?.name}</div>
                    <div className="text-xs text-gray-500 font-normal">
                      HCP: {sc.handicap_at_time}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 18 }, (_, i) => i + 1).map((holeNumber) => {
                // Get hole data from first scorecard
                const holeData = match.scorecards?.[0]?.hole_scores?.find(
                  (hs: any) => hs.hole?.hole_number === holeNumber
                );

                return (
                  <tr key={holeNumber} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{holeNumber}</td>
                    <td className="p-3 text-center">{holeData?.hole?.par || '-'}</td>
                    <td className="p-3 text-center text-sm text-gray-600 dark:text-gray-300">
                      {holeData?.hole?.handicap_index || '-'}
                    </td>
                    {match.scorecards?.map((sc: any) => {
                      const holeScore = sc.hole_scores?.find(
                        (hs: any) => hs.hole?.hole_number === holeNumber
                      );
                      const isWinner = holeScore?.points_earned === 1;
                      const isTieHole = holeScore?.points_earned === 0.5;

                      return (
                        <td key={sc.id} className="p-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded ${
                              isWinner
                                ? 'bg-green-100 text-green-800 font-bold'
                                : isTieHole
                                ? 'bg-yellow-100 text-yellow-800'
                                : ''
                            }`}
                          >
                            {holeScore?.strokes || '-'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Totals Row */}
              <tr className="bg-gray-100 dark:bg-gray-700 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                <td className="p-3" colSpan={3}>
                  TOTAL
                </td>
                {match.scorecards?.map((sc: any) => (
                  <td key={sc.id} className="p-3 text-center">
                    <div>{sc.total_score}</div>
                    <div className="text-xs font-normal text-gray-600 dark:text-gray-300">
                      {sc.points_earned} pts
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            href="/matches"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Back to Matches
          </Link>
          <Link
            href="/standings"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            View Standings
          </Link>
        </div>
      </main>
    </div>
  );
}
