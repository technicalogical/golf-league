'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
}

interface League {
  id: string;
  name: string;
  description: string;
}

export default function LeagueJoinRequestPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [leagueId]);

  async function loadData() {
    try {
      // Load league
      const leagueRes = await fetch(`/api/leagues/${leagueId}`);
      if (leagueRes.ok) {
        const leagueData = await leagueRes.json();
        setLeague(leagueData);
      }

      // Load user's teams where they are captain
      const teamsRes = await fetch('/api/teams/my-captain-teams');
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData);
        if (teamsData.length > 0) {
          setSelectedTeamId(teamsData[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/leagues/${leagueId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: selectedTeamId,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      alert('Join request submitted successfully! The league admin will review your request.');
      router.push(`/leagues/${leagueId}/public`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href={`/leagues/${leagueId}/public`}
              className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
            >
              ← Back to League
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request to Join League</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Teams Found</h2>
            <p className="text-gray-700 mb-4">
              You need to be a team captain to request to join a league.
            </p>
            <Link
              href="/teams/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create a Team
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/leagues/${leagueId}/public`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to League
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request to Join League</h1>
          {league && <p className="text-gray-600 mt-1">{league.name}</p>}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="team" className="block text-sm font-semibold text-gray-900 mb-2">
                Select Team *
              </label>
              <select
                id="team"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only teams you captain are shown
              </p>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                Message to League Admin (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell the league admin why your team wants to join..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your request will be sent to the league admin</li>
                <li>• They'll review your team and message</li>
                <li>• You'll be notified when they approve or reject</li>
                <li>• Once approved, your team can participate in matches</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <Link
                href={`/leagues/${leagueId}/public`}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
