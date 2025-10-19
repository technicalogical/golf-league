'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RemoveTeamButton({
  leagueId,
  teamId,
  teamName,
}: {
  leagueId: string;
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    if (!confirm(`Remove ${teamName} from this league? This will delete all their matches and scores.`)) {
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch(`/api/leagues/${leagueId}/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove team');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsRemoving(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRemoving ? 'Removing...' : 'Remove'}
    </button>
  );
}
