'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function JoinOpenTeamButton({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  async function handleJoin() {
    if (!confirm(`Join ${teamName}?`)) {
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch(`/api/teams/${teamId}/join-open`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join team');
      }

      router.push(`/teams/${teamId}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsJoining(false);
    }
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isJoining}
      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isJoining ? 'Joining...' : 'Join Team'}
    </button>
  );
}
