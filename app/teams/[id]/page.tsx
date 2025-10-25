import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-server';
import TeamMembersList from './TeamMembersList';
import InviteCodeDisplay from './InviteCodeDisplay';
import LeaveTeamButton from './LeaveTeamButton';

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/api/auth/login');
  }

  const userId = session.user.sub;
  const { id } = await params;

  // Fetch team with members
  const { data: team, error } = await supabaseAdmin
    .from('teams')
    .select(`
      *,
      captain:profiles!teams_captain_id_fkey(
        id,
        name,
        display_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Not Found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Fetch team members with player stats
  const { data: members } = await supabaseAdmin
    .from('team_members')
    .select(`
      *,
      user:profiles(
        id,
        name,
        display_name,
        email,
        show_email,
        avatar_url
      )
    `)
    .eq('team_id', id)
    .order('is_captain', { ascending: false })
    .order('joined_at', { ascending: true });

  // Get player records for team members
  const memberUserIds = members?.map((m: any) => m.user_id) || [];
  const { data: players } = await supabaseAdmin
    .from('players')
    .select('id, user_id, handicap, team_id')
    .in('user_id', memberUserIds)
    .eq('team_id', id);

  // Get match counts for each player
  const playerIds = players?.map((p: any) => p.id) || [];
  const { data: scorecards } = await supabaseAdmin
    .from('scorecards')
    .select(`
      player_id,
      points_earned,
      match:matches!inner(status)
    `)
    .in('player_id', playerIds);

  // Aggregate stats by player
  const playerStats = (players || []).map((player: any) => {
    const playerScorecards = (scorecards || []).filter(
      (sc: any) => sc.player_id === player.id && sc.match?.status === 'completed'
    );
    const totalPoints = playerScorecards.reduce(
      (sum: number, sc: any) => sum + (sc.points_earned || 0),
      0
    );

    return {
      user_id: player.user_id,
      player_id: player.id,
      handicap: player.handicap,
      matches_played: playerScorecards.length,
      total_points: totalPoints,
    };
  });

  // Merge stats with members
  const membersWithStats = (members || []).map((member: any) => {
    const stats = playerStats.find((ps: any) => ps.user_id === member.user_id);
    return {
      ...member,
      stats: stats || {
        player_id: null,
        handicap: null,
        matches_played: 0,
        total_points: 0,
      },
    };
  });

  // Check if current user is captain
  const isCaptain = team.captain_id === userId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Captain: {team.captain?.display_name || team.captain?.name || 'Unknown'}
                {isCaptain && <span className="ml-2 text-blue-600">(You)</span>}
              </p>
            </div>
            {team.is_active ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-semibold">
                Active
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 text-sm rounded-full font-semibold">
                Inactive
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Team Members ({members?.length || 0} / {team.max_members})
                </h2>
              </div>

              <TeamMembersList
                teamId={team.id}
                members={membersWithStats || []}
                isCaptain={isCaptain}
                currentUserId={userId}
              />

              {(!membersWithStats || membersWithStats.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No members yet. Share the invite code to add teammates.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Settings (Captain Only) */}
            {isCaptain && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Captain Controls</h3>
                <Link
                  href={`/teams/${team.id}/settings`}
                  className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-center mb-3"
                >
                  Team Settings
                </Link>
                {team.open_to_join && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
                    ✓ Team is open - anyone can join
                  </p>
                )}
              </div>
            )}

            {/* Invite Code */}
            {isCaptain && (
              <InviteCodeDisplay inviteCode={team.invite_code} />
            )}

            {/* Team Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Max Members</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{team.max_members}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Available Spots</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {team.max_members - (members?.length || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Created</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isCaptain && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <LeaveTeamButton teamId={team.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
