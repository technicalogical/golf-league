import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseAdmin } from '@/lib/supabase-server';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) {
    redirect('/api/auth/login');
  }

  const userId = session.user?.sub;

  // Check if user is site admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_site_admin')
    .eq('id', userId)
    .single();

  if (!profile?.is_site_admin) {
    redirect('/dashboard');
  }

  // Get some stats for the dashboard
  const { data: stats } = await supabaseAdmin.rpc('get_admin_stats').single();

  // If the RPC doesn't exist, get stats manually
  const { count: usersCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: leaguesCount } = await supabaseAdmin
    .from('leagues')
    .select('*', { count: 'exact', head: true });

  const { count: teamsCount } = await supabaseAdmin
    .from('teams')
    .select('*', { count: 'exact', head: true });

  const { count: matchesCount } = await supabaseAdmin
    .from('matches')
    .select('*', { count: 'exact', head: true });

  const { count: coursesCount } = await supabaseAdmin
    .from('courses')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Site Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all aspects of the golf league platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{usersCount || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Leagues</CardDescription>
              <CardTitle className="text-3xl">{leaguesCount || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Teams</CardDescription>
              <CardTitle className="text-3xl">{teamsCount || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Matches</CardDescription>
              <CardTitle className="text-3xl">{matchesCount || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Golf Courses</CardDescription>
              <CardTitle className="text-3xl">{coursesCount || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course Management */}
          <Link href="/admin/courses">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">⛳</div>
                  <div>
                    <CardTitle>Manage Courses</CardTitle>
                    <CardDescription>Edit and delete golf courses</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Team Management */}
          <Link href="/admin/teams">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">👥</div>
                  <div>
                    <CardTitle>Manage Teams</CardTitle>
                    <CardDescription>View, edit, and delete teams</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* User Management */}
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">👤</div>
                  <div>
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>View users and grant admin access</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* League Management */}
          <Link href="/admin/leagues">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-yellow-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🏆</div>
                  <div>
                    <CardTitle>Manage Leagues</CardTitle>
                    <CardDescription>View and manage all leagues</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Player Sync */}
          <Link href="/admin/sync-players">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🔄</div>
                  <div>
                    <CardTitle>Sync Players</CardTitle>
                    <CardDescription>Create player records for team members</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Database Tools */}
          <Link href="/admin/database">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-red-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🗄️</div>
                  <div>
                    <CardTitle>Database Tools</CardTitle>
                    <CardDescription>Cleanup and maintenance utilities</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
