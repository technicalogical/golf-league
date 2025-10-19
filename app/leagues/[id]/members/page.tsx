'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Member {
  id: string;
  user_id: string;
  role: string;
  user: {
    id: string;
    name: string;
    display_name?: string;
    email: string;
  };
}

export default function ManageLeagueMembersPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<string>('viewer');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMembers();
  }, [leagueId]);

  async function loadMembers() {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/members`);
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (!newMemberEmail) {
      setError('Please enter an email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/leagues/${leagueId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add member');
      }

      setSuccess('Member added successfully');
      setNewMemberEmail('');
      setNewMemberRole('viewer');
      loadMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateRole(memberId: string, newRole: string) {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/leagues/${leagueId}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      setSuccess('Role updated successfully');
      loadMembers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Are you sure you want to remove this member from the league?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/leagues/${leagueId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      setSuccess('Member removed successfully');
      loadMembers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/leagues/${leagueId}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to League
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Manage League Members</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
            {success}
          </div>
        )}

        {/* Add Member Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Member</h2>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="member@example.com"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-2">
                Role
              </label>
              <select
                id="role"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="viewer">Viewer</option>
                <option value="player">Player</option>
                <option value="team_captain">Team Captain</option>
                <option value="league_admin">League Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding Member...' : 'Add Member'}
            </button>
          </form>
        </div>

        {/* Current Members */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Current Members ({members.length})
          </h2>
          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No members yet.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {member.user?.display_name || member.user?.name || member.user?.email}
                    </div>
                    <div className="text-sm text-gray-500">{member.user?.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="player">Player</option>
                      <option value="team_captain">Team Captain</option>
                      <option value="league_admin">League Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
