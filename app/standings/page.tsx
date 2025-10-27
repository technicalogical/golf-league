'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
            <Select value={selectedLeagueId} onValueChange={setSelectedLeagueId}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select a league" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches</SelectItem>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* View Toggle with Tabs */}
        <Tabs defaultValue="teams" className="mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="teams">Team Standings</TabsTrigger>
            <TabsTrigger value="players">Player Standings</TabsTrigger>
          </TabsList>

          {/* Team Standings */}
          <TabsContent value="teams">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Rank</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Team</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">GP</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">Points</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">W</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">L</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">T</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamStandings.map((team, index) => (
                    <TableRow
                      key={team.team_id}
                      className={`border-b dark:border-gray-700 ${
                        index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      }`}
                    >
                      <TableCell className="p-4">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            index === 0
                              ? 'bg-yellow-400 text-yellow-900 font-bold'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 font-semibold">
                        <div className="flex items-center gap-2">
                          {team.team_name}
                          {index === 0 && teamStandings.length > 0 && team.matches_played > 0 && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700">
                              Champion
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-center">{team.matches_played}</TableCell>
                      <TableCell className="p-4 text-center font-bold text-blue-600 dark:text-blue-400">
                        {team.total_points}
                      </TableCell>
                      <TableCell className="p-4 text-center text-green-600 dark:text-green-400">
                        {team.wins}
                      </TableCell>
                      <TableCell className="p-4 text-center text-red-600 dark:text-red-400">
                        {team.losses}
                      </TableCell>
                      <TableCell className="p-4 text-center text-gray-600 dark:text-gray-300">
                        {team.ties}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {teamStandings.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No team data available yet
                </div>
              )}
            </div>
          </TabsContent>

          {/* Player Standings */}
          <TabsContent value="players">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Rank</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Player</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Team</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">HCP</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">GP</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">Points</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">Avg Score</TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 dark:text-white">Best</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStandings.map((player, index) => (
                    <TableRow
                      key={player.player_id}
                      className={`border-b dark:border-gray-700 ${
                        index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      }`}
                    >
                      <TableCell className="p-4">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            index === 0
                              ? 'bg-yellow-400 text-yellow-900 font-bold'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 font-semibold">
                        <div className="flex items-center gap-2">
                          {player.player_name}
                          {index === 0 && playerStandings.length > 0 && player.matches_played > 0 && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700">
                              Top Player
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4 text-gray-600 dark:text-gray-300">{player.team_name}</TableCell>
                      <TableCell className="p-4 text-center">{player.handicap}</TableCell>
                      <TableCell className="p-4 text-center">{player.matches_played}</TableCell>
                      <TableCell className="p-4 text-center font-bold text-blue-600 dark:text-blue-400">
                        {player.total_points}
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        {player.avg_score.toFixed(1)}
                      </TableCell>
                      <TableCell className="p-4 text-center text-green-600 dark:text-green-400">
                        {player.best_score || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {playerStandings.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No player data available yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
          <Button asChild>
            <Link href="/matches">
              View Matches
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
