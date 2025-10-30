'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  handicap: number;
  team_id: string;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
}

export default function LeagueHandicapsPage() {
  const params = useParams();
  const leagueId = params.id as string;

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingHandicap, setEditingHandicap] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTeamsAndPlayers();
  }, [leagueId]);

  async function loadTeamsAndPlayers() {
    try {
      // Get teams in league
      const teamsRes = await fetch(`/api/leagues/${leagueId}/teams`);
      const teamsData = await teamsRes.json();

      // Get players for each team
      const teamsWithPlayers = await Promise.all(
        teamsData.map(async (lt: any) => {
          const playersRes = await fetch(`/api/teams/${lt.team.id}/players`);
          const playersData = await playersRes.json();

          return {
            id: lt.team.id,
            name: lt.team.name,
            players: playersData.filter((p: Player) => p.team_id === lt.team.id),
          };
        })
      );

      setTeams(teamsWithPlayers);
    } catch (error) {
      console.error('Failed to load teams and players:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleHandicapChange(playerId: string, value: string) {
    setEditingHandicap(prev => ({ ...prev, [playerId]: value }));
  }

  async function saveHandicap(player: Player) {
    const newHandicap = editingHandicap[player.id];
    if (newHandicap === undefined || newHandicap === '') {
      return;
    }

    const handicapNum = parseFloat(newHandicap);
    if (isNaN(handicapNum) || handicapNum < 0 || handicapNum > 54) {
      setMessage('Handicap must be between 0 and 54');
      return;
    }

    setSaving(player.id);
    setMessage('');

    try {
      const response = await fetch(`/api/players/${player.id}/handicap`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handicap: handicapNum }),
      });

      if (response.ok) {
        setMessage(`Updated ${player.name}'s handicap to ${handicapNum}`);
        // Update local state
        setTeams(prevTeams =>
          prevTeams.map(team => ({
            ...team,
            players: team.players.map(p =>
              p.id === player.id ? { ...p, handicap: handicapNum } : p
            ),
          }))
        );
        // Clear editing state
        setEditingHandicap(prev => {
          const newState = { ...prev };
          delete newState[player.id];
          return newState;
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update handicap');
      }
    } catch (error) {
      console.error('Failed to save handicap:', error);
      setMessage('Failed to save handicap');
    } finally {
      setSaving(null);
    }
  }

  function cancelEdit(playerId: string) {
    setEditingHandicap(prev => {
      const newState = { ...prev };
      delete newState[playerId];
      return newState;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Handicaps
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set and update player handicaps for your league
            </p>
          </div>
          <Link href={`/leagues/${leagueId}`}>
            <Button variant="outline">Back to League</Button>
          </Link>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Failed') || message.includes('must be')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Teams and Players */}
        <div className="space-y-6">
          {teams.map(team => (
            <Card key={team.id}>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardTitle className="text-xl">{team.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {team.players.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No players on this team
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Player Name
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Current Handicap
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.players.map(player => (
                          <tr
                            key={player.id}
                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="py-3 px-4 text-gray-900 dark:text-white">
                              {player.name}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {editingHandicap[player.id] !== undefined ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="54"
                                  step="0.1"
                                  value={editingHandicap[player.id]}
                                  onChange={(e) => handleHandicapChange(player.id, e.target.value)}
                                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {player.handicap}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {editingHandicap[player.id] !== undefined ? (
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    onClick={() => saveHandicap(player)}
                                    disabled={saving === player.id}
                                  >
                                    {saving === player.id ? 'Saving...' : 'Save'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => cancelEdit(player.id)}
                                    disabled={saving === player.id}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleHandicapChange(player.id, player.handicap.toString())
                                  }
                                >
                                  Edit
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No teams in this league yet. Add teams to manage player handicaps.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
