'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    avatar_url?: string;
  };
  stats: {
    player_id: string | null;
    handicap: number | null;
    matches_played: number;
    total_points: number;
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
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            {/* Avatar */}
            <Link
              href={`/profile/${member.user_id}`}
              className="flex-shrink-0 group"
            >
              {member.user.avatar_url ? (
                <img
                  src={member.user.avatar_url}
                  alt={displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200 group-hover:border-blue-700 group-hover:scale-105 transition-all">
                  {displayName[0].toUpperCase()}
                </div>
              )}
            </Link>

            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900 truncate">{displayName}</h4>
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

              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                {member.stats.handicap !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">HCP:</span>
                    <span className="font-semibold text-gray-900">{member.stats.handicap}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Matches:</span>
                  <span className="font-semibold text-gray-900">{member.stats.matches_played}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-semibold text-blue-600">{member.stats.total_points.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            {isCaptain && !member.is_captain && !isCurrentUser && (
              <button
                onClick={() => handleRemoveMember(member.id, displayName)}
                disabled={removing === member.id}
                className="flex-shrink-0 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
