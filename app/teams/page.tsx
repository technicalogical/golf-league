import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function TeamsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  // Fetch all teams with player count
  const { data: teams, error } = await supabase
    .from('teams')
    .select(`
      *,
      players:players(count)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching teams:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
            </div>
            <Link
              href="/teams/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Create Team
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!teams || teams.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🏌️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Teams Yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get started by creating your first team.
            </p>
            <Link
              href="/teams/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create First Team
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const playerCount = team.players?.[0]?.count || 0;

              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                    {team.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Players:</span>
                      <span>{playerCount} / 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Created:</span>
                      <span>{new Date(team.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                      View Details →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
