'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: string;
  name: string;
  par: number;
  location: string;
}

interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  course_id: string;
  match_date: string;
  league_id: string | null;
  week_number: number | null;
  holes_to_play: number;
  nine_selection: string | null;
  tee_selection: string;
  status: string;
  team1: { name: string };
  team2: { name: string };
}

export default function EditMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [holesToPlay, setHolesToPlay] = useState<number>(18);
  const [nineSelection, setNineSelection] = useState<string>('front');
  const [teeSelection, setTeeSelection] = useState<string>('Blue');
  const [stimpSetting, setStimpSetting] = useState<number>(9.0);
  const [pinPlacement, setPinPlacement] = useState<string>('Intermediate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [matchId]);

  async function loadData() {
    try {
      // Fetch match details
      const matchRes = await fetch(`/api/matches/${matchId}`);
      const matchResponse = await matchRes.json();

      // The API returns { match, holes, players, existing_scores }
      const matchData = matchResponse.match || matchResponse;
      setMatch(matchData);

      // Set form values from match
      setCourseId(matchData.course_id);
      setMatchDate(matchData.match_date);
      setHolesToPlay(matchData.holes_to_play || 18);
      setNineSelection(matchData.nine_selection || 'front');
      setTeeSelection(matchData.tee_selection || 'Blue');
      setStimpSetting(matchData.stimp_setting || 9.0);
      setPinPlacement(matchData.pin_placement || 'Intermediate');

      // Fetch courses
      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      setCourses(coursesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load match data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!courseId || !matchDate) {
      setError('Course and match date are required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: courseId,
          match_date: matchDate,
          holes_to_play: holesToPlay,
          nine_selection: holesToPlay === 9 ? nineSelection : null,
          tee_selection: teeSelection,
          stimp_setting: stimpSetting,
          pin_placement: pinPlacement,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update match');
      }

      router.push(`/matches/${matchId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Match Not Found</h1>
          <Link href="/matches" className="text-blue-600 hover:text-blue-800">
            ← Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  if (match.status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href={`/matches/${matchId}`}
              className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
            >
              ← Back to Match
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Match</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Edit Completed Match</h2>
            <p className="text-gray-700 mb-4">
              This match has already been completed and cannot be edited.
            </p>
            <Link
              href={`/matches/${matchId}`}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              ← Back to Match
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/matches/${matchId}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to Match
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Match</h1>
          {match.team1 && match.team2 && (
            <p className="text-gray-600 mt-1">
              {match.team1.name} vs {match.team2.name}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="course" className="block text-sm font-semibold text-gray-900 mb-2">
                Course *
              </label>
              <select
                id="course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label htmlFor="match_date" className="block text-sm font-semibold text-gray-900 mb-2">
                Match Date *
              </label>
              <input
                type="date"
                id="match_date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="holes_to_play" className="block text-sm font-semibold text-gray-900 mb-2">
                Holes to Play *
              </label>
              <select
                id="holes_to_play"
                value={holesToPlay}
                onChange={(e) => setHolesToPlay(parseInt(e.target.value))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="18">18 Holes</option>
                <option value="9">9 Holes</option>
              </select>
            </div>

            {holesToPlay === 9 && (
              <div>
                <label htmlFor="nine_selection" className="block text-sm font-semibold text-gray-900 mb-2">
                  Which Nine? *
                </label>
                <select
                  id="nine_selection"
                  value={nineSelection}
                  onChange={(e) => setNineSelection(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="front">Front 9 (Holes 1-9)</option>
                  <option value="back">Back 9 (Holes 10-18)</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="tee_selection" className="block text-sm font-semibold text-gray-900 mb-2">
                Tee Selection *
              </label>
              <select
                id="tee_selection"
                value={teeSelection}
                onChange={(e) => setTeeSelection(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Black">Black Tees</option>
                <option value="Gold">Gold Tees</option>
                <option value="Blue">Blue Tees (Default)</option>
                <option value="White">White Tees</option>
                <option value="Red">Red Tees</option>
              </select>
            </div>

            <div>
              <label htmlFor="stimp_setting" className="block text-sm font-semibold text-gray-900 mb-2">
                Stimp Setting: {stimpSetting}
              </label>
              <input
                type="range"
                id="stimp_setting"
                min="1"
                max="12"
                step="0.5"
                value={stimpSetting}
                onChange={(e) => setStimpSetting(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1.0 (Slow)</span>
                <span>12.0 (Fast)</span>
              </div>
            </div>

            <div>
              <label htmlFor="pin_placement" className="block text-sm font-semibold text-gray-900 mb-2">
                Pin Placement *
              </label>
              <select
                id="pin_placement"
                value={pinPlacement}
                onChange={(e) => setPinPlacement(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Novice">Novice</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/matches/${matchId}`}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-center"
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
