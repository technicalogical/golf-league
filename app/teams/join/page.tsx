'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinTeamPage() {
  const router = useRouter();

  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_code: inviteCode.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join team');
      }

      const data = await response.json();
      router.push(`/teams/${data.team_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Join a Team</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700 mb-6">
            Enter the invite code provided by your team captain to join their team.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-semibold text-gray-900 mb-2">
                Invite Code *
              </label>
              <input
                type="text"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                maxLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl font-mono text-center uppercase"
                placeholder="ABCD1234"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 8-character code (not case-sensitive)
              </p>
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Joining Team...' : 'Join Team'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Don't have an invite code?</h3>
          <p className="text-sm text-blue-800 mb-3">
            You can create your own team or ask your team captain for their invite code.
          </p>
          <Link
            href="/teams/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
          >
            Create New Team
          </Link>
        </div>
      </main>
    </div>
  );
}
