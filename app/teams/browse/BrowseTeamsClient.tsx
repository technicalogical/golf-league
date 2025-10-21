'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import JoinOpenTeamButton from './JoinOpenTeamButton';

interface Team {
  id: string;
  name: string;
  description: string | null;
  max_members: number;
  created_at: string;
  captain: {
    id: string;
    name: string | null;
    display_name: string | null;
  };
  memberCount: number;
  isMember: boolean;
  isFull: boolean;
}

export default function BrowseTeamsClient({ teams }: { teams: Team[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const filteredAndSortedTeams = useMemo(() => {
    let result = [...teams];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((team) =>
        team.name.toLowerCase().includes(query) ||
        team.description?.toLowerCase().includes(query) ||
        (team.captain?.display_name || team.captain?.name || '').toLowerCase().includes(query)
      );
    }

    // Filter by availability
    if (showOnlyAvailable) {
      result = result.filter((team) => !team.isFull && !team.isMember);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else { // oldest
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

    return result;
  }, [teams, searchQuery, showOnlyAvailable, sortBy]);

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-semibold text-gray-900 mb-2">
              Search Teams
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Team name, description, captain..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-semibold text-gray-900 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Team Name (A-Z)</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Filters
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show only available teams
              </span>
            </label>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredAndSortedTeams.length}</span> of{' '}
            <span className="font-semibold">{teams.length}</span> teams
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredAndSortedTeams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Teams Found</h2>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'There are currently no teams accepting new members.'}
          </p>
          {searchQuery || showOnlyAvailable ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowOnlyAvailable(false);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Clear Filters
            </button>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/teams/new"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Create Your Own Team
              </Link>
              <Link
                href="/teams/join"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Join with Code
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{team.name}</h3>
                  <p className="text-sm text-gray-600">
                    Captain: {team.captain?.display_name || team.captain?.name || 'Unknown'}
                  </p>
                </div>
                {team.isFull && (
                  <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded">
                    Full
                  </span>
                )}
              </div>

              {team.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {team.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-semibold text-gray-900">
                    {team.memberCount} / {team.max_members}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available Spots:</span>
                  <span className="font-semibold text-gray-900">
                    {team.max_members - team.memberCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-700">
                    {new Date(team.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {team.isMember ? (
                <Link
                  href={`/teams/${team.id}`}
                  className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-center"
                >
                  View Team
                </Link>
              ) : team.isFull ? (
                <button
                  disabled
                  className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                >
                  Team Full
                </button>
              ) : (
                <JoinOpenTeamButton teamId={team.id} teamName={team.name} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
