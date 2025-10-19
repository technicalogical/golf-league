'use client';

import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  handicap: number;
  is_active: boolean;
  created_at: string;
}

export default function PlayerList({
  teamId,
  players,
}: {
  teamId: string;
  players: Player[];
}) {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {players.map((player) => (
        <Link
          key={player.id}
          href={`/players/${player.id}`}
          className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{player.name}</h3>
              <p className="text-sm text-gray-600">Handicap: {player.handicap}</p>
            </div>
            {player.is_active ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Inactive
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
