import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Home() {
  const session = await getSession();

  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Indoor Golf League
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Track scores, manage teams, and view standings for your indoor golf league
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">⛳</div>
              <CardTitle>Scorecard Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Easy hole-by-hole score entry with automatic handicap calculation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">🏆</div>
              <CardTitle>Live Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Real-time team and player rankings updated after each match
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">📊</div>
              <CardTitle>Match Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed match breakdowns with head-to-head scoring
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 justify-center flex-wrap">
            <form action="/api/auth/login" method="get">
              <Button
                type="submit"
                size="lg"
                className="text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </form>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link href="/standings">
                View Standings
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            First time? Sign in to create your account
          </p>
        </div>

        <Card className="mt-16">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-3">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
