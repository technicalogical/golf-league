import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PlayerEditForm from './PlayerEditForm';

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/api/auth/login');
  }

  const { id } = await params;

  // Fetch player with team
  const { data: player, error } = await supabase
    .from('players')
    .select(`
      *,
      team:teams(
        id,
        name,
        is_active
      )
    `)
    .eq('id', id)
    .single();

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Player Not Found</h1>
          <Link href="/teams" className="text-blue-600 hover:text-blue-800">
            ← Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/teams/${player.team_id}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to {player.team?.name || 'Team'}
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
            {player.is_active ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-semibold">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-semibold">
                Inactive
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Player Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Player Information</h2>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-900">Team:</span>{' '}
                <Link
                  href={`/teams/${player.team_id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {player.team?.name || 'Unknown'}
                </Link>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Current Handicap:</span>{' '}
                <span className="text-2xl font-bold text-blue-600">{player.handicap}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Status:</span>{' '}
                <span className={player.is_active ? 'text-green-600' : 'text-gray-600'}>
                  {player.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Created:</span>{' '}
                <span className="text-gray-600">
                  {new Date(player.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Player</h2>
            <PlayerEditForm player={player} />
          </div>
        </div>

        {/* Stats Placeholder */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Match History</h2>
          <p className="text-gray-500 text-center py-8">
            Match history will appear here once matches are recorded.
          </p>
        </div>
      </main>
    </div>
  );
}
