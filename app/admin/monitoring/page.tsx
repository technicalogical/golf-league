'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SystemMetrics {
  timestamp: string;
  system: {
    totalUsers: number;
    totalLeagues: number;
    totalTeams: number;
    totalMatches: number;
    completedMatches: number;
    matchCompletionRate: string;
  };
  activity: {
    newUsers: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
    activeUsers: {
      last7Days: number;
    };
    newMatches: {
      last24Hours: number;
      last7Days: number;
    };
    newLeagues: {
      last30Days: number;
    };
  };
  performance: {
    largestLeagueSize: number;
    totalScores: number;
    totalScorecards: number;
    avgScoresPerScorecard: string;
    incompleteProfiles: number;
  };
  users: {
    totalEngaged: number;
    adminUsers: number;
    usersWithTeams: number;
    usersInLeagues: number;
    engagementRate: string;
  };
  trends: {
    userGrowth: {
      thisWeek: number;
      lastWeek: number;
      growthRate: string;
    };
    matchGrowth: {
      thisWeek: number;
      lastWeek: number;
      growthRate: string;
    };
  };
}

export default function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/system/metrics');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatGrowthRate = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate > 0) {
      return <span className="text-green-600">+{rate}%</span>;
    } else if (numRate < 0) {
      return <span className="text-red-600">{rate}%</span>;
    }
    return <span className="text-gray-600">0%</span>;
  };

  const getHealthStatus = () => {
    if (!metrics) return 'unknown';

    const completionRate = parseFloat(metrics.system.matchCompletionRate);
    const engagementRate = parseFloat(metrics.users.engagementRate);

    if (completionRate > 70 && engagementRate > 60) return 'excellent';
    if (completionRate > 50 && engagementRate > 40) return 'good';
    if (completionRate > 30 && engagementRate > 20) return 'fair';
    return 'needs-attention';
  };

  const healthStatus = getHealthStatus();
  const statusColors = {
    excellent: 'bg-green-100 text-green-800 border-green-200',
    good: 'bg-blue-100 text-blue-800 border-blue-200',
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'needs-attention': 'bg-red-100 text-red-800 border-red-200',
    unknown: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading system metrics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              System Monitoring
            </h1>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Metrics</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchMetrics} className="bg-red-600 hover:bg-red-700">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                System Monitoring
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time platform analytics and performance metrics
              </p>
            </div>
            <div className="text-right">
              <Button
                onClick={fetchMetrics}
                disabled={loading}
                className="mb-2"
              >
                {loading ? 'Refreshing...' : 'Refresh Now'}
              </Button>
              {lastUpdated && (
                <p className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {metrics && (
          <>
            {/* System Health Overview */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">🏥</span>
                    System Health Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Badge className={`px-4 py-2 text-lg font-semibold ${statusColors[healthStatus]}`}>
                      {healthStatus.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Match Completion: {metrics.system.matchCompletionRate}% |
                      User Engagement: {metrics.users.engagementRate}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Users</CardDescription>
                  <CardTitle className="text-3xl">{metrics.system.totalUsers.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {metrics.users.totalEngaged} engaged ({metrics.users.engagementRate}%)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Active Leagues</CardDescription>
                  <CardTitle className="text-3xl">{metrics.system.totalLeagues.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {metrics.activity.newLeagues.last30Days} new this month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Teams</CardDescription>
                  <CardTitle className="text-3xl">{metrics.system.totalTeams.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {metrics.users.usersWithTeams} users on teams
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Matches Played</CardDescription>
                  <CardTitle className="text-3xl">{metrics.system.completedMatches.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {metrics.system.matchCompletionRate}% completion rate
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">👥</span>
                    User Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.activity.newUsers.last24Hours}
                      </div>
                      <div className="text-sm text-gray-600">New users (24h)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.activity.activeUsers.last7Days}
                      </div>
                      <div className="text-sm text-gray-600">Active users (7d)</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Recent Growth</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Last 7 days: {metrics.activity.newUsers.last7Days}</div>
                      <div>Last 30 days: {metrics.activity.newUsers.last30Days}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    Match Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {metrics.activity.newMatches.last24Hours}
                      </div>
                      <div className="text-sm text-gray-600">New matches (24h)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics.activity.newMatches.last7Days}
                      </div>
                      <div className="text-sm text-gray-600">New matches (7d)</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Performance</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Total matches: {metrics.system.totalMatches}</div>
                      <div>Completion rate: {metrics.system.matchCompletionRate}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Growth Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">📈</span>
                    User Growth Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This week</span>
                      <span className="font-semibold">{metrics.trends.userGrowth.thisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last week</span>
                      <span className="font-semibold">{metrics.trends.userGrowth.lastWeek}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Growth rate</span>
                      <span className="font-bold">
                        {formatGrowthRate(metrics.trends.userGrowth.growthRate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    Match Activity Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This week</span>
                      <span className="font-semibold">{metrics.trends.matchGrowth.thisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last week</span>
                      <span className="font-semibold">{metrics.trends.matchGrowth.lastWeek}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Growth rate</span>
                      <span className="font-bold">
                        {formatGrowthRate(metrics.trends.matchGrowth.growthRate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance & System Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">💾</span>
                    Data Storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total scorecards</span>
                    <span className="font-semibold">{metrics.performance.totalScorecards.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total hole scores</span>
                    <span className="font-semibold">{metrics.performance.totalScores.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">Avg scores/card</span>
                    <span className="font-semibold">{metrics.performance.avgScoresPerScorecard}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    User Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Users in leagues</span>
                    <span className="font-semibold">{metrics.users.usersInLeagues.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Users on teams</span>
                    <span className="font-semibold">{metrics.users.usersWithTeams.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">Admin users</span>
                    <span className="font-semibold">{metrics.users.adminUsers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Largest league</span>
                    <span className="font-semibold">{metrics.performance.largestLeagueSize} teams</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Incomplete profiles</span>
                    <span className="font-semibold">{metrics.performance.incompleteProfiles}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">Data generated</span>
                    <span className="font-semibold text-xs">{metrics.timestamp.slice(0, 16)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">🔧</span>
                  Quick Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full">
                      Manage Users
                    </Button>
                  </Link>
                  <Link href="/admin/leagues">
                    <Button variant="outline" className="w-full">
                      Manage Leagues
                    </Button>
                  </Link>
                  <Link href="/admin/database">
                    <Button variant="outline" className="w-full">
                      Database Tools
                    </Button>
                  </Link>
                  <Link href="/admin/teams">
                    <Button variant="outline" className="w-full">
                      Manage Teams
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}