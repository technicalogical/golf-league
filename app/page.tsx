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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto text-center p-4">
        {/* Hero Section - Above the fold */}
        <div className="min-h-screen flex flex-col justify-center py-8 md:py-16">
          <div className="mb-6 md:mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Indoor Golf League
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Track scores, manage teams, and view standings for your indoor golf league
            </p>
          </div>

          {/* Login buttons - Prominently positioned */}
          <div className="space-y-4 mb-8">
            <div className="flex gap-4 justify-center flex-wrap">
              <form action="/api/auth/login" method="get">
                <Button
                  type="submit"
                  size="lg"
                  className="text-lg px-8 py-6 w-full sm:w-auto"
                >
                  Sign In to Get Started
                </Button>
              </form>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 w-full sm:w-auto"
                asChild
              >
                <Link href="/standings">
                  View Public Standings
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              First time? Sign in to create your account instantly
            </p>
          </div>

          {/* Quick features preview - Compact for mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow p-4">
              <div className="text-3xl mb-2">⛳</div>
              <h3 className="font-semibold mb-2">Score Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Easy score entry with handicaps
              </p>
            </Card>

            <Card className="hover:shadow-lg transition-shadow p-4">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-semibold mb-2">Live Standings</h3>
              <p className="text-sm text-muted-foreground">
                Real-time team rankings
              </p>
            </Card>

            <Card className="hover:shadow-lg transition-shadow p-4">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">Match Results</h3>
              <p className="text-sm text-muted-foreground">
                Detailed breakdowns
              </p>
            </Card>
          </div>
        </div>

        {/* Detailed information - Below the fold */}
        <div className="py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">🏌️ Team Format</h4>
                  <p className="text-sm text-muted-foreground">
                    2 players per team compete in head-to-head matchups against other teams
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⚡ Scoring System</h4>
                  <p className="text-sm text-muted-foreground">
                    Lowest handicap plays opponent's lowest. Strokes given on par 4s and 5s only
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 Points System</h4>
                  <p className="text-sm text-muted-foreground">
                    Win a hole = 1 point. Team with lowest net total = 1 bonus point
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📈 Handicaps</h4>
                  <p className="text-sm text-muted-foreground">
                    Updated throughout the season to reflect current skill level
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
