'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Team {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  par: number;
  location: string;
}

interface Match {
  id?: string;
  team1_id: string;
  team2_id: string;
  match_date: string;
  course_id: string;
  holes_to_play: number;
  nine_selection: string | null;
  tee_selection: string;
  pin_position: string;
  stimp_rating: string;
  status: string;
  week_number: number;
  team1?: { name: string };
  team2?: { name: string };
  course?: { name: string };
}

interface WeekCalendar {
  week_number: number;
  date: string;
  is_active: boolean;
  notes: string;
}

export default function ScheduleManagementPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [teams, setTeams] = useState<Team[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [weekCalendar, setWeekCalendar] = useState<WeekCalendar[]>([]);
  const [existingMatches, setExistingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calendar setup state
  const [startDate, setStartDate] = useState('');
  const [numberOfWeeks, setNumberOfWeeks] = useState<number>(12);
  const [showCalendarSetup, setShowCalendarSetup] = useState(true);

  useEffect(() => {
    loadData();
  }, [leagueId]);

  async function loadData() {
    try {
      // Fetch teams
      const teamsResponse = await fetch(`/api/leagues/${leagueId}/teams`);
      const teamsData = await teamsResponse.json();
      const teamsList = teamsData.map((lt: any) => lt.team);
      setTeams(teamsList);

      // Fetch courses
      const coursesResponse = await fetch('/api/courses');
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // Fetch existing matches
      const matchesResponse = await fetch(`/api/leagues/${leagueId}/matches`);
      const matchesData = await matchesResponse.json();
      setExistingMatches(matchesData);

      // Build week calendar - show all weeks up to max week with matches
      const weeksMap = new Map<number, WeekCalendar>();
      let maxWeek = 0;

      matchesData.forEach((match: Match) => {
        if (match.week_number) {
          maxWeek = Math.max(maxWeek, match.week_number);
          if (!weeksMap.has(match.week_number)) {
            weeksMap.set(match.week_number, {
              week_number: match.week_number,
              date: match.match_date,
              is_active: true,
              notes: '',
            });
          }
        }
      });

      // If we have matches, show all weeks from 1 to maxWeek (even if empty)
      if (maxWeek > 0) {
        const calendar: WeekCalendar[] = [];

        // Find the earliest match date to calculate week dates from
        let baseDate = new Date();
        if (weeksMap.has(1)) {
          baseDate = new Date(weeksMap.get(1)!.date);
        } else if (matchesData.length > 0) {
          // Use earliest match date
          const sortedMatches = [...matchesData].sort((a, b) =>
            new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
          );
          baseDate = new Date(sortedMatches[0].match_date);
        }

        for (let i = 1; i <= maxWeek; i++) {
          if (weeksMap.has(i)) {
            calendar.push(weeksMap.get(i)!);
          } else {
            // Create empty week based on week 1 or earliest match
            const weekDate = new Date(baseDate);
            weekDate.setDate(baseDate.getDate() + (i - 1) * 7);
            calendar.push({
              week_number: i,
              date: weekDate.toISOString().split('T')[0],
              is_active: true,
              notes: '',
            });
          }
        }

        setWeekCalendar(calendar);
        setShowCalendarSetup(false);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function generateCalendar() {
    if (!startDate) {
      setError('Please select a start date');
      return;
    }

    const calendar: WeekCalendar[] = [];
    const start = new Date(startDate);

    for (let i = 0; i < numberOfWeeks; i++) {
      const weekDate = new Date(start);
      weekDate.setDate(start.getDate() + (i * 7));

      calendar.push({
        week_number: i + 1,
        date: weekDate.toISOString().split('T')[0],
        is_active: true,
        notes: '',
      });
    }

    setWeekCalendar(calendar);
    setShowCalendarSetup(false);
    setSuccess('Calendar created! Now you can add matches week by week.');
  }

  function toggleWeekActive(weekNumber: number) {
    setWeekCalendar(prev =>
      prev.map(week =>
        week.week_number === weekNumber
          ? { ...week, is_active: !week.is_active }
          : week
      )
    );
  }

  function updateWeekDate(weekNumber: number, newDate: string) {
    setWeekCalendar(prev =>
      prev.map(week =>
        week.week_number === weekNumber
          ? { ...week, date: newDate }
          : week
      )
    );
  }

  function getMatchesForWeek(weekNumber: number): Match[] {
    return existingMatches.filter(m => m.week_number === weekNumber);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  // Note: No longer requiring minimum team count - you can set up the schedule first
  const hasTeamsWarning = teams.length < 2;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/leagues/${leagueId}`} className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to League
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set up your season calendar, then add matches week by week
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
        {hasTeamsWarning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6">
            <p className="font-semibold mb-1">Note: You currently have {teams.length} team(s) in this league</p>
            <p className="text-sm">
              You can set up your season calendar now, but you'll need teams added before scheduling matches.{' '}
              <Link href={`/leagues/${leagueId}/teams/add`} className="underline font-semibold">
                Add teams now
              </Link>
            </p>
          </div>
        )}

        {/* Calendar Setup */}
        {showCalendarSetup && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step 1: Set Up Season Calendar</CardTitle>
              <CardDescription>
                Choose your start date and number of weeks. You can add matches to specific weeks later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold mb-2">
                  Season Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="numberOfWeeks" className="block text-sm font-semibold mb-2">
                  Number of Weeks
                </label>
                <input
                  type="number"
                  id="numberOfWeeks"
                  min="1"
                  max="52"
                  value={numberOfWeeks}
                  onChange={(e) => setNumberOfWeeks(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Set any number of weeks for your season (1-52). Teams can play multiple times per week or take breaks.
                </p>
              </div>

              <Button onClick={generateCalendar} className="w-full">
                Create Season Calendar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Week-by-Week Schedule Management */}
        {!showCalendarSetup && weekCalendar.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Season Calendar ({weekCalendar.length} weeks)</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const lastWeek = weekCalendar[weekCalendar.length - 1];
                    const newWeekNumber = lastWeek.week_number + 1;
                    const newDate = new Date(lastWeek.date);
                    newDate.setDate(newDate.getDate() + 7);

                    setWeekCalendar([...weekCalendar, {
                      week_number: newWeekNumber,
                      date: newDate.toISOString().split('T')[0],
                      is_active: true,
                      notes: '',
                    }]);
                  }}
                >
                  + Add Week
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCalendarSetup(true)}
                >
                  Reset Calendar
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> Click "Add Matches" on any week to schedule matches. Use the "+ Add Week" button above to extend your season, or create matches in future weeks to automatically add those weeks to your calendar.
              </p>
            </div>

            <div className="space-y-4">
              {weekCalendar.map((week) => {
                const weekMatches = getMatchesForWeek(week.week_number);
                const hasMatches = weekMatches.length > 0;

                return (
                  <Card key={week.week_number} className={!week.is_active ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle>Week {week.week_number}</CardTitle>
                          {!week.is_active && <Badge variant="secondary">Skipped</Badge>}
                          {hasMatches && <Badge variant="active">{weekMatches.length} match{weekMatches.length !== 1 ? 'es' : ''}</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleWeekActive(week.week_number)}
                          >
                            {week.is_active ? 'Skip Week' : 'Activate Week'}
                          </Button>
                          {week.is_active && (
                            <Link href={`/leagues/${leagueId}/schedule/week/${week.week_number}`}>
                              <Button size="sm">
                                {hasMatches ? 'Edit Matches' : 'Add Matches'}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {week.is_active && (
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-semibold mb-1">Week Date</label>
                            <input
                              type="date"
                              value={week.date}
                              onChange={(e) => updateWeekDate(week.week_number, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>

                          {hasMatches && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-sm font-semibold mb-2">Scheduled Matches:</p>
                                <div className="space-y-2">
                                  {weekMatches.map((match) => (
                                    <div
                                      key={match.id}
                                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                                    >
                                      <div>
                                        <p className="font-semibold text-sm">
                                          {match.team1?.name} vs {match.team2?.name}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          {match.course?.name} • {match.holes_to_play} holes • {match.tee_selection} tees
                                        </p>
                                      </div>
                                      <Badge variant={match.status as any}>{match.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          {!hasMatches && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No matches scheduled for this week yet
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
