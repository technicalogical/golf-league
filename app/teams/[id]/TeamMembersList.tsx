'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  user_id: string;
  is_captain: boolean;
  joined_at: string;
  user: {
    id: string;
    name?: string;
    display_name?: string;
    email: string;
    show_email: boolean;
  };
}

export default function TeamMembersList({
  teamId,
  members,
  isCaptain,
  currentUserId,
}: {
  teamId: string;
  members: Member[];
  isCaptain: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemoveMember(memberId: string, memberName: string) {
    if (!confirm(`Remove ${memberName} from the team?`)) {
      return;
    }

    setRemoving(memberId);

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const isCurrentUser = member.user_id === currentUserId;
        const displayName = member.user.display_name || member.user.name || 'Unknown User';

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{displayName}</h4>
                {isCurrentUser && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                    You
                  </span>
                )}
                {member.is_captain && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                    Captain
                  </span>
                )}
              </div>
              {member.user.show_email && (
                <p className="text-sm text-gray-600 mt-1">{member.user.email}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>

            {isCaptain && !member.is_captain && !isCurrentUser && (
              <button
                onClick={() => handleRemoveMember(member.id, displayName)}
                disabled={removing === member.id}
                className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removing === member.id ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
