'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DestroyScheduleButton({ leagueId }: { leagueId: string }) {
  const router = useRouter();
  const [isDestroying, setIsDestroying] = useState(false);

  async function handleDestroy() {
    if (!confirm('⚠️ WARNING: This will DELETE ALL MATCHES and schedules for this league. This cannot be undone! Are you sure?')) {
      return;
    }

    if (!confirm('This is your final warning. All match data, scores, and schedules will be permanently deleted. Continue?')) {
      return;
    }

    setIsDestroying(true);

    try {
      const response = await fetch(`/api/leagues/${leagueId}/schedule`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to destroy schedule');
      }

      alert('Schedule destroyed successfully. You can now generate a new schedule.');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDestroying(false);
    }
  }

  return (
    <button
      onClick={handleDestroy}
      disabled={isDestroying}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDestroying ? 'Destroying...' : 'Destroy Schedule'}
    </button>
  );
}
