import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-server';

export default async function LeagueMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  const { id: leagueId } = await params;
  const userId = session.user.sub;

  // Fetch league info
  const { data: league } = await supabaseAdmin
    .from('leagues')
    .select('*')
    .eq('id', leagueId)
    .single();

  if (!league) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">League Not Found</h1>
          <Link href="/matches" className="text-blue-600 hover:text-blue-800">
            ← Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  // Fetch user's teams
  const { data: userTeams } = await supabaseAdmin
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);

  const teamIds = userTeams?.map(tm => tm.team_id) || [];

  // Fetch matches where user's team is playing in this league
  const { data: matches, error } = await supabaseAdmin
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name),
      team2:teams!matches_team2_id_fkey(id, name),
      course:courses(id, name, par)
    `)
    .eq('league_id', leagueId)
    .or(`team1_id.in.(${teamIds.join(',')}),team2_id.in.(${teamIds.join(',')})`)
    .order('match_date', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
  }

  // Separate matches by status
  const scheduled = matches?.filter(m => m.status === 'scheduled') || [];
  const inProgress = matches?.filter(m => m.status === 'in_progress') || [];
  const completed = matches?.filter(m => m.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to League Selection
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{league.name}</h1>
              <p className="text-gray-600 mt-1">Your team's matches</p>
            </div>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded ${
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* In Progress Matches */}
        {inProgress.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">In Progress</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {inProgress.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Matches */}
        {scheduled.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduled</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {scheduled.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Matches */}
        {completed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {completed.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!matches || matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🏌️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Matches</h2>
            <p className="text-gray-600 mb-6">
              Your team doesn't have any matches scheduled in this league yet.
            </p>
            <Link
              href={`/leagues/${leagueId}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              View League Details
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function MatchCard({ match }: { match: any }) {
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

  return (
    <Link
      href={`/matches/${match.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">
            {match.match_date ? new Date(match.match_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }) : 'Date TBD'}
          </div>
          <div className="text-xs text-gray-500">{match.course?.name || 'Course TBD'}</div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusColors[match.status as keyof typeof statusColors]}`}>
          {statusLabels[match.status as keyof typeof statusLabels]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">{match.team1?.name || 'Team 1'}</span>
          {match.status === 'completed' && match.team1_points !== null && (
            <span className="text-2xl font-bold text-blue-600">{match.team1_points}</span>
          )}
        </div>
        <div className="border-t border-gray-200"></div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">{match.team2?.name || 'Team 2'}</span>
          {match.status === 'completed' && match.team2_points !== null && (
            <span className="text-2xl font-bold text-blue-600">{match.team2_points}</span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        {match.status === 'scheduled' && (
          <span className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
            Start Match →
          </span>
        )}
        {match.status === 'in_progress' && (
          <span className="text-yellow-600 hover:text-yellow-800 text-sm font-semibold">
            Enter Scores →
          </span>
        )}
        {match.status === 'completed' && (
          <span className="text-green-600 hover:text-green-800 text-sm font-semibold">
            View Results →
          </span>
        )}
      </div>
    </Link>
  );
}
