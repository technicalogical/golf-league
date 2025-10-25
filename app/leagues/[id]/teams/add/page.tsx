'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  is_active: boolean;
}

export default function AddTeamsToLeaguePage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [leagueTeams, setLeagueTeams] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [leagueId]);

  async function loadData() {
    try {
      // Fetch all active teams
      const teamsRes = await fetch('/api/teams');
      const teams = await teamsRes.json();
      const activeTeams = teams.filter((t: Team) => t.is_active);
      setAllTeams(activeTeams);

      // Fetch teams already in league
      const leagueTeamsRes = await fetch(`/api/leagues/${leagueId}/teams`);
      const leagueTeamsData = await leagueTeamsRes.json();
      const existingTeamIds = leagueTeamsData.map((lt: any) => lt.team_id);
      setLeagueTeams(existingTeamIds);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }

  function toggleTeam(teamId: string) {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (selectedTeams.length === 0) {
      setError('Please select at least one team');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/leagues/${leagueId}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_ids: selectedTeams,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add teams');
      }

      router.push(`/leagues/${leagueId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading teams...</div>
      </div>
    );
  }

  const availableTeams = allTeams.filter((t) => !leagueTeams.includes(t.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/leagues/${leagueId}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to League
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Teams to League</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {availableTeams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">All active teams are already in this league.</p>
              <Link
                href={`/leagues/${leagueId}`}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to League
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Teams ({selectedTeams.length} selected)
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableTeams.map((team) => (
                    <label
                      key={team.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                        selectedTeams.includes(team.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team.id)}
                        onChange={() => toggleTeam(team.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-900 font-medium">{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || selectedTeams.length === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding Teams...' : `Add ${selectedTeams.length} Team(s)`}
                </button>
                <Link
                  href={`/leagues/${leagueId}`}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
