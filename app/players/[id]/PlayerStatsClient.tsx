'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PlayerStats {
  totalMatches: number;
  totalPoints: number;
  wins: number;
  losses: number;
  ties: number;
  avgScore: number;
  bestScore: number | null;
  worstScore: number | null;
  avgNetScore: number;
  recentMatches: {
    matchId: string;
    date: string;
    opponent: string;
    score: number;
    netScore: number;
    points: number;
    result: 'W' | 'L' | 'T';
  }[];
  scoreHistory: {
    date: string;
    score: number;
    netScore: number;
  }[];
  pointsHistory: {
    date: string;
    points: number;
  }[];
}

interface HeadToHeadRecord {
  opponentId: string;
  opponentName: string;
  matches: number;
  wins: number;
  losses: number;
  ties: number;
  playerTotalPoints: number;
  opponentTotalPoints: number;
  playerAvgScore: number;
  opponentAvgScore: number;
  lastMeetingDate: string;
  lastResult: 'W' | 'L' | 'T';
}

interface PlayerStatsClientProps {
  playerId: string;
  playerName: string;
}

export default function PlayerStatsClient({
  playerId,
  playerName,
}: PlayerStatsClientProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [h2hRecords, setH2hRecords] = useState<HeadToHeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [h2hLoading, setH2hLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadH2H();
  }, [playerId]);

  async function loadStats() {
    try {
      const response = await fetch(`/api/players/${playerId}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load player stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadH2H() {
    try {
      const response = await fetch(`/api/players/${playerId}/head-to-head`);
      const data = await response.json();
      setH2hRecords(data);
    } catch (error) {
      console.error('Failed to load head-to-head records:', error);
    } finally {
      setH2hLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  if (!stats || stats.totalMatches === 0) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Career Statistics</h2>
        <p className="text-gray-500 text-center py-8">
          No match data available yet. Statistics will appear once matches are completed.
        </p>
      </div>
    );
  }

  const winPercentage = ((stats.wins / stats.totalMatches) * 100).toFixed(1);

  return (
    <div className="mt-8 space-y-8">
      {/* Career Stats Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Career Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalMatches}</div>
            <div className="text-sm text-gray-600 mt-1">Matches Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalPoints}</div>
            <div className="text-sm text-gray-600 mt-1">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.avgScore}</div>
            <div className="text-sm text-gray-600 mt-1">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.avgNetScore}</div>
            <div className="text-sm text-gray-600 mt-1">Avg Net Score</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
            <div className="text-sm text-gray-600 mt-1">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
            <div className="text-sm text-gray-600 mt-1">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.ties}</div>
            <div className="text-sm text-gray-600 mt-1">Ties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{winPercentage}%</div>
            <div className="text-sm text-gray-600 mt-1">Win Rate</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.bestScore || '-'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Best Round</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.worstScore || '-'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Worst Round</div>
          </div>
        </div>
      </div>

      {/* Score Trend Chart */}
      {stats.scoreHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Score Trend (Last 10 Matches)</h2>
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {stats.scoreHistory.map((item, index) => {
                const maxScore = Math.max(...stats.scoreHistory.map((s) => s.score));
                const minScore = Math.min(...stats.scoreHistory.map((s) => s.score));
                const range = maxScore - minScore || 1;
                const height = ((item.score - minScore) / range) * 80 + 20;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-2">{item.score}</div>
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${item.date}: ${item.score} (Net: ${item.netScore})`}
                    />
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {item.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Points Per Match Chart */}
      {stats.pointsHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Points Per Match (Last 10 Matches)</h2>
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {stats.pointsHistory.map((item, index) => {
                const maxPoints = 18; // Maximum possible points in a match
                const height = (item.points / maxPoints) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-2">{item.points}</div>
                    <div
                      className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${item.date}: ${item.points} points`}
                    />
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                      {item.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {stats.recentMatches.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Matches</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left font-semibold">Date</th>
                <th className="p-4 text-left font-semibold">Opponent</th>
                <th className="p-4 text-center font-semibold">Score</th>
                <th className="p-4 text-center font-semibold">Net</th>
                <th className="p-4 text-center font-semibold">Points</th>
                <th className="p-4 text-center font-semibold">Result</th>
                <th className="p-4 text-center font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentMatches.map((match) => (
                <tr key={match.matchId} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(match.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4">{match.opponent}</td>
                  <td className="p-4 text-center font-semibold">{match.score}</td>
                  <td className="p-4 text-center">{match.netScore}</td>
                  <td className="p-4 text-center font-bold text-blue-600">{match.points}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        match.result === 'W'
                          ? 'bg-green-100 text-green-800'
                          : match.result === 'L'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {match.result}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      href={`/matches/${match.matchId}/results`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Head-to-Head Records */}
      {!h2hLoading && h2hRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Head-to-Head Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Individual matchup records against all opponents
            </p>
          </div>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left font-semibold">Opponent</th>
                <th className="p-4 text-center font-semibold">Matches</th>
                <th className="p-4 text-center font-semibold">Record</th>
                <th className="p-4 text-center font-semibold">Avg Score</th>
                <th className="p-4 text-center font-semibold">Opp Avg</th>
                <th className="p-4 text-center font-semibold">Total Pts</th>
                <th className="p-4 text-center font-semibold">Opp Pts</th>
                <th className="p-4 text-center font-semibold">Last Result</th>
              </tr>
            </thead>
            <tbody>
              {h2hRecords.map((h2h) => {
                const winPct = h2h.matches > 0 ? ((h2h.wins / h2h.matches) * 100).toFixed(0) : '0';
                const hasAdvantage = h2h.playerTotalPoints > h2h.opponentTotalPoints;

                return (
                  <tr key={h2h.opponentId} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <Link
                        href={`/players/${h2h.opponentId}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {h2h.opponentName}
                      </Link>
                    </td>
                    <td className="p-4 text-center">{h2h.matches}</td>
                    <td className="p-4 text-center">
                      <div className="font-semibold">
                        <span className="text-green-600">{h2h.wins}</span>
                        {' - '}
                        <span className="text-red-600">{h2h.losses}</span>
                        {h2h.ties > 0 && (
                          <>
                            {' - '}
                            <span className="text-gray-600">{h2h.ties}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">({winPct}%)</div>
                    </td>
                    <td className="p-4 text-center font-semibold">{h2h.playerAvgScore}</td>
                    <td className="p-4 text-center text-gray-600">{h2h.opponentAvgScore}</td>
                    <td className="p-4 text-center">
                      <span className={hasAdvantage ? 'text-green-600 font-bold' : ''}>
                        {h2h.playerTotalPoints}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={!hasAdvantage && h2h.opponentTotalPoints > h2h.playerTotalPoints ? 'text-red-600 font-bold' : 'text-gray-600'}>
                        {h2h.opponentTotalPoints}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            h2h.lastResult === 'W'
                              ? 'bg-green-100 text-green-800'
                              : h2h.lastResult === 'L'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {h2h.lastResult}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(h2h.lastMeetingDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
