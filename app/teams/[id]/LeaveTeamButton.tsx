'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LeaveTeamButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this team?')) {
      return;
    }

    setIsLeaving(true);

    try {
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to leave team');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsLeaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLeave}
      disabled={isLeaving}
      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLeaving ? 'Leaving...' : 'Leave Team'}
    </button>
  );
}
