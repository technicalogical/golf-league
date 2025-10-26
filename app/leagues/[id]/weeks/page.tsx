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
  week_number: number;
  match_date: string;
  course_id: string;
  holes_to_play: number;
  nine_selection: string | null;
  tee_selection: string;
  stimp_setting: number;
  pin_placement: string;
  team1: { name: string };
  team2: { name: string };
}

interface WeekSettings {
  week_number: number;
  matches: Match[];
  course_id: string;
  holes_to_play: number;
  nine_selection: string;
  tee_selection: string;
  stimp_setting: number;
  pin_placement: string;
}

export default function LeagueWeekSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [weekSettings, setWeekSettings] = useState<{ [key: number]: WeekSettings }>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [leagueId]);

  async function loadData() {
    try {
      // Fetch courses
      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      setCourses(coursesData);

      // Fetch league matches grouped by week
      const matchesRes = await fetch(`/api/leagues/${leagueId}/matches`);
      const matchesData = await matchesRes.json();
      setMatches(matchesData);

      // Initialize week settings from existing matches
      const weekSettingsMap: { [key: number]: WeekSettings } = {};
      matchesData.forEach((match: Match) => {
        if (match.week_number && !weekSettingsMap[match.week_number]) {
          weekSettingsMap[match.week_number] = {
            week_number: match.week_number,
            matches: [],
            course_id: match.course_id,
            holes_to_play: match.holes_to_play || 18,
            nine_selection: match.nine_selection || 'front',
            tee_selection: match.tee_selection || 'Blue',
            stimp_setting: match.stimp_setting || 9.0,
            pin_placement: match.pin_placement || 'Intermediate',
          };
        }
        if (match.week_number) {
          weekSettingsMap[match.week_number].matches.push(match);
        }
      });

      setWeekSettings(weekSettingsMap);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load league data');
    } finally {
      setLoading(false);
    }
  }

  function updateWeekSetting(weekNumber: number, field: string, value: any) {
    setWeekSettings(prev => ({
      ...prev,
      [weekNumber]: {
        ...prev[weekNumber],
        [field]: value,
      },
    }));
  }

  async function handleSaveWeek(weekNumber: number) {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const settings = weekSettings[weekNumber];
    const matchIds = settings.matches.map(m => m.id);

    try {
      const response = await fetch(`/api/leagues/${leagueId}/weeks/${weekNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_ids: matchIds,
          course_id: settings.course_id,
          holes_to_play: settings.holes_to_play,
          nine_selection: settings.holes_to_play === 9 ? settings.nine_selection : null,
          tee_selection: settings.tee_selection,
          stimp_setting: settings.stimp_setting,
          pin_placement: settings.pin_placement,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update week settings');
      }

      setSuccess(`Week ${weekNumber} settings saved successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      loadData(); // Reload to get updated data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  const weeks = Object.keys(weekSettings)
    .map(Number)
    .sort((a, b) => a - b);

  if (weeks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href={`/leagues/${leagueId}`}
              className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
            >
              ← Back to League
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Week Settings</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No scheduled matches with week numbers found. Generate a schedule first.
            </p>
            <Link
              href={`/leagues/${leagueId}/schedule`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
            >
              Generate Schedule
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/leagues/${leagueId}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to League
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Week Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure course, format, and conditions for each week
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

        <div className="space-y-6">
          {weeks.map((weekNumber) => {
            const week = weekSettings[weekNumber];
            return (
              <div key={weekNumber} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Week {weekNumber}
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {week.matches.length} match{week.matches.length !== 1 ? 'es' : ''}
                  </span>
                </div>

                {/* Matches in this week */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Matches:</p>
                  <div className="space-y-1">
                    {week.matches.map((match) => (
                      <div key={match.id} className="text-sm text-gray-600 dark:text-gray-300">
                        • {match.team1.name} vs {match.team2.name} - {new Date(match.match_date).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Course */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Course
                    </label>
                    <select
                      value={week.course_id}
                      onChange={(e) => updateWeekSetting(weekNumber, 'course_id', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name} (Par {course.par})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Holes to Play */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Holes to Play
                    </label>
                    <select
                      value={week.holes_to_play}
                      onChange={(e) => updateWeekSetting(weekNumber, 'holes_to_play', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="18">18 Holes</option>
                      <option value="9">9 Holes</option>
                    </select>
                  </div>

                  {/* Nine Selection (conditional) */}
                  {week.holes_to_play === 9 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Which Nine?
                      </label>
                      <select
                        value={week.nine_selection}
                        onChange={(e) => updateWeekSetting(weekNumber, 'nine_selection', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="front">Front 9 (Holes 1-9)</option>
                        <option value="back">Back 9 (Holes 10-18)</option>
                      </select>
                    </div>
                  )}

                  {/* Tee Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Tee Selection
                    </label>
                    <select
                      value={week.tee_selection}
                      onChange={(e) => updateWeekSetting(weekNumber, 'tee_selection', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Black">Black Tees</option>
                      <option value="Gold">Gold Tees</option>
                      <option value="Blue">Blue Tees</option>
                      <option value="White">White Tees</option>
                      <option value="Red">Red Tees</option>
                    </select>
                  </div>

                  {/* Stimp Setting */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Stimp Setting: {week.stimp_setting}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="0.5"
                      value={week.stimp_setting}
                      onChange={(e) => updateWeekSetting(weekNumber, 'stimp_setting', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1.0 (Slow)</span>
                      <span>12.0 (Fast)</span>
                    </div>
                  </div>

                  {/* Pin Placement */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Pin Placement
                    </label>
                    <select
                      value={week.pin_placement}
                      onChange={(e) => updateWeekSetting(weekNumber, 'pin_placement', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Novice">Novice</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveWeek(weekNumber)}
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : `Save Week ${weekNumber} Settings`}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
