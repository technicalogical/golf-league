import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-server';
import JoinOpenTeamButton from './JoinOpenTeamButton';

export default async function BrowseTeamsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/api/auth/login');
  }

  const userId = session.user.sub;

  // Fetch open teams with member count
  const { data: openTeams } = await supabaseAdmin
    .from('teams')
    .select(`
      *,
      captain:profiles!teams_captain_id_fkey(
        id,
        name,
        display_name
      )
    `)
    .eq('open_to_join', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Get member counts and check if user is already a member
  const teamsWithDetails = await Promise.all(
    (openTeams || []).map(async (team) => {
      const { count: memberCount } = await supabaseAdmin
        .from('team_members')
        .select('id', { count: 'exact', head: true })
        .eq('team_id', team.id);

      const { data: userMembership } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', userId)
        .single();

      return {
        ...team,
        memberCount: memberCount || 0,
        isMember: !!userMembership,
        isFull: (memberCount || 0) >= team.max_members,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Browse Open Teams</h1>
          <p className="text-gray-600 mt-1">Join a team that's looking for members</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {teamsWithDetails.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Open Teams</h2>
            <p className="text-gray-600 mb-6">
              There are currently no teams accepting new members.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/teams/new"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Create Your Own Team
              </Link>
              <Link
                href="/teams/join"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Join with Code
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamsWithDetails.map((team) => (
              <div key={team.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-600">
                      Captain: {team.captain?.display_name || team.captain?.name || 'Unknown'}
                    </p>
                  </div>
                  {team.isFull && (
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded">
                      Full
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-semibold text-gray-900">
                      {team.memberCount} / {team.max_members}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available Spots:</span>
                    <span className="font-semibold text-gray-900">
                      {team.max_members - team.memberCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-700">
                      {new Date(team.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {team.isMember ? (
                  <Link
                    href={`/teams/${team.id}`}
                    className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-center"
                  >
                    View Team
                  </Link>
                ) : team.isFull ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Team Full
                  </button>
                ) : (
                  <JoinOpenTeamButton teamId={team.id} teamName={team.name} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
