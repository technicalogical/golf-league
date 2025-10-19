'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Player {
  id: string;
  team_id: string;
  name: string;
  handicap: number;
  is_active: boolean;
}

export default function PlayerEditForm({ player }: { player: Player }) {
  const router = useRouter();
  const [name, setName] = useState(player.name);
  const [handicap, setHandicap] = useState(player.handicap);
  const [isActive, setIsActive] = useState(player.is_active);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          handicap,
          is_active: isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update player');
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove this player from the team? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete player');
      }

      router.push(`/teams/${player.team_id}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
          Player updated successfully!
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="handicap" className="block text-sm font-semibold text-gray-900 mb-2">
          Handicap
        </label>
        <input
          type="number"
          id="handicap"
          value={handicap}
          onChange={(e) => setHandicap(parseInt(e.target.value))}
          required
          min="0"
          max="54"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-600 mt-1">
          Update as skill level changes throughout the season (0-54)
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
          Active (can participate in matches)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Remove
        </button>
      </div>
    </form>
  );
}
