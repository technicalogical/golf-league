'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SyncPlayersPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleSync() {
    setSyncing(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/sync-players', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Sync Players & League Members</h1>
          <p className="text-gray-600 mt-1">
            Creates missing player records and league memberships for team members
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What this does:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 mb-6">
            <li>
              Creates <strong>player</strong> records for team members who don't have one
            </li>
            <li>Links players to their user profiles via profile_id</li>
            <li>Sets default handicap to 18 (can be updated later)</li>
            <li>
              Adds team members to their team's leagues as <strong>league members</strong>
            </li>
          </ul>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">✓ Sync Complete!</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{result.playersCreated} player records created</li>
                <li>{result.leagueMembersCreated} league memberships created</li>
                <li>{result.playersSkipped} players already existed</li>
                <li>{result.leagueMembersSkipped} league memberships already existed</li>
              </ul>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? 'Syncing...' : 'Run Sync'}
          </button>
        </div>
      </main>
    </div>
  );
}
