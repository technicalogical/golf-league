import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-server';
import BrowseTeamsClient from './BrowseTeamsClient';

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
        <BrowseTeamsClient teams={teamsWithDetails} />
      </main>
    </div>
  );
}
