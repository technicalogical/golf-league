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

  // Fetch user's teams
  const { data: userTeams } = await supabaseAdmin
    .from('team_members')
    .select(`
      *,
      team:teams(
        id,
        name,
        is_active,
        max_members
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

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

        {/* My Teams */}
        {userTeams && userTeams.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">My Teams</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTeams.map((membership: any) => (
                <Link
                  key={membership.id}
                  href={`/teams/${membership.team.id}`}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{membership.team.name}</h4>
                    {membership.is_captain && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                        Captain
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {membership.team.is_active ? (
                      <span className="text-green-600">● Active</span>
                    ) : (
                      <span className="text-gray-500">● Inactive</span>
                    )}
                  </p>
                </Link>
              ))}
            </div>
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
            href="/schedule"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Schedule</h3>
            <p className="text-gray-600">
              View upcoming matches
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
