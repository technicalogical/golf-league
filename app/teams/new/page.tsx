'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(2);
  const [openToJoin, setOpenToJoin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          max_members: maxMembers,
          open_to_join: openToJoin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create team');
      }

      const data = await response.json();
      router.push(`/teams/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/teams" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Teams
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your team name..."
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Team Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell others about your team..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Help others understand your team's style, goals, or personality
              </p>
            </div>

            <div>
              <label htmlFor="maxMembers" className="block text-sm font-semibold text-gray-900 mb-2">
                Maximum Team Members
              </label>
              <select
                id="maxMembers"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 Members</option>
                <option value={3}>3 Members</option>
                <option value={4}>4 Members</option>
                <option value={5}>5 Members</option>
                <option value={6}>6 Members</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose how many players can be on your team
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={openToJoin}
                  onChange={(e) => setOpenToJoin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-900">Open Team</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow anyone to join your team without an invite code (you can change this later)
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Team'}
              </button>
              <Link
                href="/teams"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll be automatically added as the team captain</li>
            <li>• You'll receive an invite code to share with teammates</li>
            <li>• Your team will be available to join leagues</li>
            <li>• You can manage your team members from the team page</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
