'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PlayerStats {
  player: {
    id: string;
    name: string;
    handicap: number;
    team: {
      id: string;
      name: string;
    };
  };
  stats: {
    total_matches: number;
    total_points: number;
    wins: number;
    losses: number;
    ties: number;
    avg_score: number;
    best_score: number | null;
    worst_score: number | null;
  };
  trends: Array<{
    date: string;
    score: number;
    points: number;
  }>;
  recent_matches: Array<{
    id: string;
    date: string;
    opponent: string;
    score: number;
    points: number;
    result: 'win' | 'loss' | 'tie';
  }>;
  head_to_head: Array<{
    opponent_name: string;
    matches_played: number;
    wins: number;
    losses: number;
    ties: number;
  }>;
}

export default function PlayerStatsPage() {
  const params = useParams();
  const playerId = params.id as string;

  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, [playerId]);

  async function loadStats() {
    try {
      const [statsRes, h2hRes] = await Promise.all([
        fetch(`/api/players/${playerId}/stats`),
        fetch(`/api/players/${playerId}/head-to-head`),
      ]);

      if (!statsRes.ok) {
        throw new Error('Failed to load player stats');
      }

      const statsData = await statsRes.json();
      const h2hData = await h2hRes.json();

      setStats({
        ...statsData,
        head_to_head: h2hData || [],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading player statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Player not found'}
          </h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { player, stats: playerStats, trends, recent_matches, head_to_head } = stats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href={`/teams/${player.team.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to {player.team.name}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{player.name}</h1>
              <p className="text-gray-600 mt-1">{player.team.name}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-300">Current Handicap</div>
              <div className="text-3xl font-bold text-blue-600">{player.handicap}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Career Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Matches</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{playerStats.total_matches}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Points</div>
            <div className="text-3xl font-bold text-blue-600">{playerStats.total_points.toFixed(1)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">Record</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              <span className="text-green-600">{playerStats.wins}</span>-
              <span className="text-red-600">{playerStats.losses}</span>-
              <span className="text-gray-600 dark:text-gray-300">{playerStats.ties}</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-300">Avg Score</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{playerStats.avg_score.toFixed(1)}</div>
          </div>
        </div>

        {/* Performance Trends */}
        {trends && trends.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Score Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Score Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Points Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Points Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Points"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Matches */}
        {recent_matches && recent_matches.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Matches</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Opponent</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center">Points</th>
                    <th className="p-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_matches.map((match) => (
                    <tr key={match.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(match.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">{match.opponent}</td>
                      <td className="p-3 text-center">{match.score}</td>
                      <td className="p-3 text-center font-semibold text-blue-600">
                        {match.points.toFixed(1)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            match.result === 'win'
                              ? 'bg-green-100 text-green-800'
                              : match.result === 'loss'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800'
                          }`}
                        >
                          {match.result.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Head to Head Records */}
        {head_to_head && head_to_head.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Head-to-Head Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b">
                  <tr>
                    <th className="p-3 text-left">Opponent</th>
                    <th className="p-3 text-center">Matches</th>
                    <th className="p-3 text-center">Wins</th>
                    <th className="p-3 text-center">Losses</th>
                    <th className="p-3 text-center">Ties</th>
                    <th className="p-3 text-center">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {head_to_head.map((record, index) => {
                    const winPct =
                      record.matches_played > 0
                        ? ((record.wins / record.matches_played) * 100).toFixed(0)
                        : '0';
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{record.opponent_name}</td>
                        <td className="p-3 text-center">{record.matches_played}</td>
                        <td className="p-3 text-center text-green-600">
                          {record.wins}
                        </td>
                        <td className="p-3 text-center text-red-600">
                          {record.losses}
                        </td>
                        <td className="p-3 text-center text-gray-600 dark:text-gray-300">
                          {record.ties}
                        </td>
                        <td className="p-3 text-center font-semibold">
                          {winPct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
