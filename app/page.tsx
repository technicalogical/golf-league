import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();

  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Indoor Golf League
          </h1>
          <p className="text-xl text-gray-600">
            Track scores, manage teams, and view standings for your indoor golf league
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">⛳</div>
            <h3 className="text-xl font-semibold mb-2">Scorecard Entry</h3>
            <p className="text-gray-600">
              Easy hole-by-hole score entry with automatic handicap calculation
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Live Standings</h3>
            <p className="text-gray-600">
              Real-time team and player rankings updated after each match
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Match Results</h3>
            <p className="text-gray-600">
              Detailed match breakdowns with head-to-head scoring
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 justify-center flex-wrap">
            <form action="/api/auth/login" method="get">
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg cursor-pointer"
              >
                Sign In
              </button>
            </form>
            <Link
              href="/standings"
              className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-lg shadow-lg border border-gray-200"
            >
              View Standings
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            First time? Sign in to create your account
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-300">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="text-left max-w-2xl mx-auto space-y-3 text-gray-700">
            <p>
              <strong>Team Format:</strong> 2 players per team compete in head-to-head matchups
            </p>
            <p>
              <strong>Scoring:</strong> Lowest handicap plays opponent's lowest handicap.
              Handicap difference gives strokes on par 4s and 5s only.
            </p>
            <p>
              <strong>Points:</strong> Win a hole = 1 point. Team with lowest net total = 1 point.
            </p>
            <p>
              <strong>Handicaps:</strong> Can be updated throughout the season to reflect current skill level
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
