import { supabaseAdmin } from '@/lib/supabase-server';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: profileId } = await params;
  const session = await getSession();

  // Decode the profile ID in case it's URL encoded
  const decodedProfileId = decodeURIComponent(profileId);

  // Fetch user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', decodedProfileId)
    .single();

  if (profileError || !profile) {
    console.error('Profile lookup error:', profileError);
    console.error('Looking for profile ID:', decodedProfileId);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-sm text-gray-600 mb-4">Profile ID: {decodedProfileId}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.sub === decodedProfileId;

  // Fetch user's teams
  const { data: teamMemberships } = await supabaseAdmin
    .from('team_members')
    .select(`
      team:teams(
        id,
        name,
        is_active
      ),
      is_captain
    `)
    .eq('user_id', decodedProfileId);

  // Fetch user's players (for scorecards)
  const { data: players } = await supabaseAdmin
    .from('players')
    .select('id, name, handicap, team_id')
    .eq('user_id', decodedProfileId);

  // Fetch scorecards with match and course info
  let scorecards: any[] = [];
  if (players && players.length > 0) {
    const playerIds = players.map(p => p.id);
    const { data: scorecardsData } = await supabaseAdmin
      .from('scorecards')
      .select(`
        *,
        match:matches(
          id,
          match_date,
          status,
          course:courses(
            id,
            name
          ),
          team1:teams!matches_team1_id_fkey(id, name),
          team2:teams!matches_team2_id_fkey(id, name)
        ),
        player:players(
          id,
          name,
          team_id,
          team:teams(id, name)
        )
      `)
      .in('player_id', playerIds)
      .order('created_at', { ascending: false });

    scorecards = scorecardsData || [];
  }

  // Calculate stats
  const totalRounds = scorecards.filter(s => s.match?.status === 'completed').length;
  const avgScore = totalRounds > 0
    ? (scorecards
        .filter(s => s.match?.status === 'completed' && s.total_score)
        .reduce((sum, s) => sum + (s.total_score || 0), 0) / totalRounds).toFixed(1)
    : 'N/A';
  const totalPoints = scorecards
    .filter(s => s.match?.status === 'completed')
    .reduce((sum, s) => sum + (s.points_earned || 0), 0)
    .toFixed(1);

  const displayName = profile.display_name || profile.name || profile.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                displayName[0].toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
              {profile.bio && (
                <p className="text-gray-600 mt-1">{profile.bio}</p>
              )}
              <div className="flex gap-4 mt-2">
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="inline-block text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit Profile →
                  </Link>
                )}
                {players && players.length > 0 && (
                  <Link
                    href={`/players/${players[0].id}`}
                    className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    📊 View Detailed Stats →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Rounds</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRounds}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                </div>
              </div>
            </div>

            {/* Teams Card */}
            {teamMemberships && teamMemberships.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Teams ({teamMemberships.length})
                </h2>
                <div className="space-y-2">
                  {teamMemberships.map((tm: any) => (
                    <Link
                      key={tm.team.id}
                      href={`/teams/${tm.team.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{tm.team.name}</span>
                        {tm.is_captain && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            Captain
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info (if visible) */}
            {(profile.show_email || profile.show_phone) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
                <div className="space-y-3">
                  {profile.show_email && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.show_phone && profile.phone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <a
                        href={`tel:${profile.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Round Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Round Results ({scorecards.length})
              </h2>
              {scorecards.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No rounds played yet.</p>
              ) : (
                <div className="space-y-3">
                  {scorecards.map((scorecard: any) => (
                    <Link
                      key={scorecard.id}
                      href={`/matches/${scorecard.match?.id}`}
                      className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {scorecard.match?.team1?.name} vs {scorecard.match?.team2?.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {scorecard.match?.course?.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {scorecard.match?.match_date
                              ? new Date(scorecard.match.match_date).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Date TBD'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded ${
                              scorecard.match?.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : scorecard.match?.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {scorecard.match?.status || 'scheduled'}
                          </span>
                        </div>
                      </div>
                      {scorecard.match?.status === 'completed' && scorecard.total_score && (
                        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-600">Score</p>
                            <p className="text-lg font-bold text-gray-900">{scorecard.total_score}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Handicap</p>
                            <p className="text-lg font-bold text-gray-900">
                              {scorecard.handicap_at_time}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Points</p>
                            <p className="text-lg font-bold text-gray-900">
                              {scorecard.points_earned}
                            </p>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
