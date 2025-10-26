'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Match {
  id: string;
  match_date: string;
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  team1_points: number | null;
  team2_points: number | null;
  status: string;
  league: { id: string; name: string } | null;
  course: { id: string; name: string } | null;
  holes_to_play: number;
  tee_selection: string;
}

interface League {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
}

export default function MatchHistoryPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for league_id in URL parameters
    const params = new URLSearchParams(window.location.search);
    const leagueId = params.get('league_id');
    if (leagueId) {
      setSelectedLeague(leagueId);
    }
    loadData();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [selectedLeague, selectedTeam, matches]);

  async function loadData() {
    try {
      // Load leagues
      const leaguesRes = await fetch('/api/leagues');
      const leaguesData = await leaguesRes.json();
      setLeagues(leaguesData || []);

      // Load teams
      const teamsRes = await fetch('/api/teams');
      const teamsData = await teamsRes.json();
      setTeams(teamsData || []);

      // Load all completed matches
      const matchesRes = await fetch('/api/matches');
      const matchesData = await matchesRes.json();

      // Filter to only completed matches
      const completed = (matchesData || []).filter(
        (m: Match) => m.status === 'completed'
      );
      setMatches(completed);
      setFilteredMatches(completed);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterMatches() {
    let filtered = [...matches];

    // Filter by league
    if (selectedLeague !== 'all') {
      filtered = filtered.filter((m) => m.league?.id === selectedLeague);
    }

    // Filter by team
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(
        (m) => m.team1.id === selectedTeam || m.team2.id === selectedTeam
      );
    }

    // Sort by date (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
    );

    setFilteredMatches(filtered);
  }

  function getWinner(match: Match): 'team1' | 'team2' | 'tie' | null {
    if (match.team1_points === null || match.team2_points === null) return null;
    if (match.team1_points > match.team2_points) return 'team1';
    if (match.team2_points > match.team1_points) return 'team2';
    return 'tie';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading match history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Match History</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
            >
              ← Dashboard
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            View all completed matches and their results
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* League Filter */}
          <div>
            <label
              htmlFor="league"
              className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
            >
              Filter by League
            </label>
            <select
              id="league"
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Leagues</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label
              htmlFor="team"
              className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
            >
              Filter by Team
            </label>
            <select
              id="team"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Showing {filteredMatches.length} of {matches.length} completed matches
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
              No matches found with the selected filters
            </div>
          ) : (
            filteredMatches.map((match) => {
              const winner = getWinner(match);
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Date and League */}
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-semibold">
                        {new Date(match.match_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      {match.league && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {match.league.name}
                        </div>
                      )}
                    </div>

                    {/* Matchup */}
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-4">
                        {/* Team 1 */}
                        <div
                          className={`flex-1 text-right ${
                            winner === 'team1'
                              ? 'font-bold text-green-600 dark:text-green-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {match.team1.name}
                        </div>

                        {/* Score */}
                        <div className="px-6 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-bold text-xl text-gray-900 dark:text-white">
                          {match.team1_points !== null ? match.team1_points : '-'}{' '}
                          <span className="text-gray-400 dark:text-gray-500">-</span>{' '}
                          {match.team2_points !== null ? match.team2_points : '-'}
                        </div>

                        {/* Team 2 */}
                        <div
                          className={`flex-1 text-left ${
                            winner === 'team2'
                              ? 'font-bold text-green-600 dark:text-green-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {match.team2.name}
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        {match.holes_to_play === 9 ? '9 Holes' : '18 Holes'} •{' '}
                        {match.tee_selection} Tees
                        {match.course && ` • ${match.course.name}`}
                      </div>
                    </div>

                    {/* View Details */}
                    <div className="text-right">
                      <span className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
