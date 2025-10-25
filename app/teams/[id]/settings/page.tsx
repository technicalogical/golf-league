'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeamSettings {
  id: string;
  name: string;
  max_members: number;
  open_to_join: boolean;
  is_active: boolean;
}

export default function TeamSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<TeamSettings | null>(null);
  const [openToJoin, setOpenToJoin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  async function loadTeam() {
    try {
      const response = await fetch(`/api/teams/${teamId}/settings`);
      const data = await response.json();

      if (response.ok) {
        setTeam(data);
        setOpenToJoin(data.open_to_join || false);
      } else {
        setError(data.error || 'Failed to load team settings');
      }
    } catch (err) {
      console.error('Error loading team:', err);
      setError('Failed to load team settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/teams/${teamId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          open_to_join: openToJoin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccess('Settings updated successfully!');
      setTimeout(() => {
        router.push(`/teams/${teamId}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Not Found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/teams/${teamId}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to Team
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Settings</h1>
          <p className="text-gray-600 mt-1">{team.name}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Join Settings</h2>

            <div className="space-y-4">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={openToJoin}
                  onChange={(e) => setOpenToJoin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Open Team</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow anyone to join your team without an invite code
                  </p>
                </div>
              </label>

              {openToJoin ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">✓ Open Team</h3>
                  <p className="text-sm text-green-800">
                    Your team will appear in the "Browse Teams" list and anyone can join without needing an invite code.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">🔒 Private Team</h3>
                  <p className="text-sm text-blue-800">
                    Only people with your invite code can join this team. Your team won't appear in public listings.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
              {success}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
            <Link
              href={`/teams/${teamId}`}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
