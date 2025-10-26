'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TeamStanding {
  team_id: string;
  team_name: string;
  matches_played: number;
  total_points: number;
  wins: number;
  losses: number;
  ties: number;
}

interface PlayerStanding {
  player_id: string;
  player_name: string;
  team_name: string;
  handicap: number;
  matches_played: number;
  total_points: number;
  avg_score: number;
  best_score: number | null;
}

interface League {
  id: string;
  name: string;
  status: string;
}

export default function StandingsPage() {
  const [teamStandings, setTeamStandings] = useState<TeamStanding[]>([]);
  const [playerStandings, setPlayerStandings] = useState<PlayerStanding[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('all');
  const [view, setView] = useState<'teams' | 'players'>('teams');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    loadStandings();
  }, [selectedLeagueId]);

  async function loadLeagues() {
    try {
      const response = await fetch('/api/leagues');
      const data = await response.json();
      setLeagues(data || []);
    } catch (error) {
      console.error('Failed to load leagues:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStandings() {
    try {
      const url = selectedLeagueId === 'all'
        ? '/api/standings'
        : `/api/standings?league_id=${selectedLeagueId}`;
      const response = await fetch(url);
      const data = await response.json();
      setTeamStandings(data.teams || []);
      setPlayerStandings(data.players || []);
    } catch (error) {
      console.error('Failed to load standings:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading standings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">League Standings</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Current season rankings and statistics
          </p>
        </div>

        {/* League Filter */}
        {leagues.length > 0 && (
          <div className="mb-6">
            <label htmlFor="league" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Filter by League
            </label>
            <select
              id="league"
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Matches</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* View Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView('teams')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'teams'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Team Standings
          </button>
          <button
            onClick={() => setView('players')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'players'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Player Standings
          </button>
        </div>

        {/* Team Standings */}
        {view === 'teams' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
                <tr>
                  <th className="p-4 text-left font-semibold">Rank</th>
                  <th className="p-4 text-left font-semibold">Team</th>
                  <th className="p-4 text-center font-semibold">GP</th>
                  <th className="p-4 text-center font-semibold">Points</th>
                  <th className="p-4 text-center font-semibold">W</th>
                  <th className="p-4 text-center font-semibold">L</th>
                  <th className="p-4 text-center font-semibold">T</th>
                </tr>
              </thead>
              <tbody>
                {teamStandings.map((team, index) => (
                  <tr
                    key={team.team_id}
                    className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0
                            ? 'bg-yellow-400 text-yellow-900 font-bold'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        {team.team_name}
                        {index === 0 && teamStandings.length > 0 && team.matches_played > 0 && (
                          <span className="text-yellow-500 text-xl" title="League Champion">
                            🏆
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">{team.matches_played}</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {team.total_points}
                    </td>
                    <td className="p-4 text-center text-green-600">
                      {team.wins}
                    </td>
                    <td className="p-4 text-center text-red-600">
                      {team.losses}
                    </td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-300">
                      {team.ties}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teamStandings.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No team data available yet
              </div>
            )}
          </div>
        )}

        {/* Player Standings */}
        {view === 'players' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
                <tr>
                  <th className="p-4 text-left font-semibold">Rank</th>
                  <th className="p-4 text-left font-semibold">Player</th>
                  <th className="p-4 text-left font-semibold">Team</th>
                  <th className="p-4 text-center font-semibold">HCP</th>
                  <th className="p-4 text-center font-semibold">GP</th>
                  <th className="p-4 text-center font-semibold">Points</th>
                  <th className="p-4 text-center font-semibold">Avg Score</th>
                  <th className="p-4 text-center font-semibold">Best</th>
                </tr>
              </thead>
              <tbody>
                {playerStandings.map((player, index) => (
                  <tr
                    key={player.player_id}
                    className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0
                            ? 'bg-yellow-400 text-yellow-900 font-bold'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        {player.player_name}
                        {index === 0 && playerStandings.length > 0 && player.matches_played > 0 && (
                          <span className="text-yellow-500 text-xl" title="Top Player">
                            🏆
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{player.team_name}</td>
                    <td className="p-4 text-center">{player.handicap}</td>
                    <td className="p-4 text-center">{player.matches_played}</td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {player.total_points}
                    </td>
                    <td className="p-4 text-center">
                      {player.avg_score.toFixed(1)}
                    </td>
                    <td className="p-4 text-center text-green-600">
                      {player.best_score || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {playerStandings.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No player data available yet
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <span className="font-semibold">GP:</span> Games Played
            </div>
            <div>
              <span className="font-semibold">W:</span> Wins
            </div>
            <div>
              <span className="font-semibold">L:</span> Losses
            </div>
            <div>
              <span className="font-semibold">T:</span> Ties
            </div>
            <div>
              <span className="font-semibold">HCP:</span> Handicap
            </div>
            <div>
              <span className="font-semibold">Avg Score:</span> Average Gross Score
            </div>
            <div>
              <span className="font-semibold">Best:</span> Best Round
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/matches"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            View Matches
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
