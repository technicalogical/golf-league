'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  is_active: boolean;
}

interface Course {
  id: string;
  name: string;
  par: number;
  location: string;
}

interface League {
  id: string;
  name: string;
  status: string;
}

export default function NewMatchPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [courseId, setCourseId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [holesToPlay, setHolesToPlay] = useState<number>(18);
  const [nineSelection, setNineSelection] = useState<string>('front');
  const [teeSelection, setTeeSelection] = useState<string>('Blue');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch active teams
        const teamsRes = await fetch('/api/teams');
        const teamsData = await teamsRes.json();
        const activeTeams = teamsData.filter((t: Team) => t.is_active);
        setTeams(activeTeams);

        // Fetch courses
        const coursesRes = await fetch('/api/courses');
        const coursesData = await coursesRes.json();
        setCourses(coursesData);

        // Fetch active leagues
        const leaguesRes = await fetch('/api/leagues');
        const leaguesData = await leaguesRes.json();
        const activeLeagues = leaguesData.filter((l: League) =>
          l.status === 'active' || l.status === 'upcoming'
        );
        setLeagues(activeLeagues);

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setMatchDate(today);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load teams and courses');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!team1Id || !team2Id || !courseId || !matchDate) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    if (team1Id === team2Id) {
      setError('Please select two different teams');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1_id: team1Id,
          team2_id: team2Id,
          course_id: courseId,
          match_date: matchDate,
          league_id: leagueId || null,
          holes_to_play: holesToPlay,
          nine_selection: holesToPlay === 9 ? nineSelection : null,
          tee_selection: teeSelection,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create match');
      }

      const data = await response.json();
      router.push(`/matches/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (teams.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
              ← Back to Matches
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule New Match</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Not Enough Teams</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You need at least 2 active teams to schedule a match.
            </p>
            <Link
              href="/teams/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create Teams
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
              ← Back to Matches
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule New Match</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Courses Available</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You need to run the database migrations to seed courses.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Matches
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule New Match</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="team1" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Team 1 *
              </label>
              <select
                id="team1"
                value={team1Id}
                onChange={(e) => setTeam1Id(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="team2" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Team 2 *
              </label>
              <select
                id="team2"
                value={team2Id}
                onChange={(e) => setTeam2Id(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id} disabled={team.id === team1Id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Course *
              </label>
              <select
                id="course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} (Par {course.par}) - {course.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="match_date" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Match Date *
              </label>
              <input
                type="date"
                id="match_date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {leagues.length > 0 && (
              <div>
                <label htmlFor="league" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  League (Optional)
                </label>
                <select
                  id="league"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">None (Friendly Match)</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name} ({league.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="holes_to_play" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Holes to Play *
              </label>
              <select
                id="holes_to_play"
                value={holesToPlay}
                onChange={(e) => setHolesToPlay(parseInt(e.target.value))}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="18">18 Holes</option>
                <option value="9">9 Holes</option>
              </select>
            </div>

            {holesToPlay === 9 && (
              <div>
                <label htmlFor="nine_selection" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Which Nine? *
                </label>
                <select
                  id="nine_selection"
                  value={nineSelection}
                  onChange={(e) => setNineSelection(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="front">Front 9 (Holes 1-9)</option>
                  <option value="back">Back 9 (Holes 10-18)</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="tee_selection" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Tee Selection *
              </label>
              <select
                id="tee_selection"
                value={teeSelection}
                onChange={(e) => setTeeSelection(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Black">Black Tees</option>
                <option value="Gold">Gold Tees</option>
                <option value="Blue">Blue Tees (Default)</option>
                <option value="White">White Tees</option>
                <option value="Red">Red Tees</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Match'}
              </button>
              <Link
                href="/matches"
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
