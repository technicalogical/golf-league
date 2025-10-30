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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Team {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  par: number;
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
  week_number: number;
  team1?: { name: string };
  team2?: { name: string };
  course?: { name: string };
  status?: string;
}

export default function WeekMatchManagementPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  const weekNumber = parseInt(params.weekNumber as string);

  const [teams, setTeams] = useState<Team[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [weekMatches, setWeekMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New match form state
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [courseId, setCourseId] = useState('');
  const [holesToPlay, setHolesToPlay] = useState(18);
  const [nineSelection, setNineSelection] = useState('front');
  const [teeSelection, setTeeSelection] = useState('Blue');
  const [pinPosition, setPinPosition] = useState('Intermediate');
  const [stimpRating, setStimpRating] = useState('10');

  useEffect(() => {
    loadData();
  }, [leagueId, weekNumber]);

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

      if (coursesData.length > 0 && !courseId) {
        setCourseId(coursesData[0].id);
      }

      // Fetch matches for this week
      const matchesResponse = await fetch(`/api/leagues/${leagueId}/matches`);
      const allMatches = await matchesResponse.json();
      const thisWeekMatches = allMatches.filter((m: Match) => m.week_number === weekNumber);
      setWeekMatches(thisWeekMatches);

      // Set default date if we have matches
      if (thisWeekMatches.length > 0 && !matchDate) {
        setMatchDate(thisWeekMatches[0].match_date);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMatch(e: React.FormEvent) {
    e.preventDefault();

    if (!team1Id || !team2Id) {
      setError('Please select both teams');
      return;
    }

    if (team1Id === team2Id) {
      setError('Teams must be different');
      return;
    }

    if (!matchDate) {
      setError('Please select a match date');
      return;
    }

    if (!courseId) {
      setError('Please select a course');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/leagues/${leagueId}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1_id: team1Id,
          team2_id: team2Id,
          match_date: matchDate,
          course_id: courseId,
          holes_to_play: holesToPlay,
          nine_selection: holesToPlay === 9 ? nineSelection : null,
          tee_selection: teeSelection,
          pin_position: pinPosition,
          stimp_rating: stimpRating,
          week_number: weekNumber,
          status: 'scheduled',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create match');
      }

      setSuccess('Match added successfully!');

      // Reset form
      setTeam1Id('');
      setTeam2Id('');

      // Reload matches
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMatch(matchId: string) {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete match');
      }

      setSuccess('Match deleted successfully');
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  // Note: Teams can play multiple matches per week, so all teams are always available

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/leagues/${leagueId}/schedule`} className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Schedule
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Week {weekNumber} Matches</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Add and manage matches for this week
              </p>
            </div>
            <div className="flex gap-2">
              {weekNumber > 1 && (
                <Link href={`/leagues/${leagueId}/schedule/week/${weekNumber - 1}`}>
                  <Button variant="outline" size="sm">
                    ← Week {weekNumber - 1}
                  </Button>
                </Link>
              )}
              <Link href={`/leagues/${leagueId}/schedule/week/${weekNumber + 1}`}>
                <Button variant="outline" size="sm">
                  Week {weekNumber + 1} →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Existing Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Matches ({weekMatches.length})</CardTitle>
              <CardDescription>
                Current matches for week {weekNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weekMatches.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No matches scheduled yet</p>
              ) : (
                <div className="space-y-3">
                  {weekMatches.map((match) => (
                    <div key={match.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold">
                            {match.team1?.name} <span className="text-gray-500">vs</span> {match.team2?.name}
                          </p>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                            <p>📅 {new Date(match.match_date).toLocaleDateString()}</p>
                            <p>⛳ {match.course?.name}</p>
                            <p>
                              🏌️ {match.holes_to_play} holes
                              {match.holes_to_play === 9 && ` (${match.nine_selection === 'front' ? 'Front' : 'Back'} 9)`}
                              {' • '}{match.tee_selection} tees
                            </p>
                            <p>📍 {match.pin_position} pins • Stimp {match.stimp_rating}</p>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Match?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this match? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMatch(match.id!)}>
                                Delete Match
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Match Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Match</CardTitle>
              <CardDescription>
                Create a new match for week {weekNumber}. Teams can play multiple matches per week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMatch} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Team 1</label>
                    <Select value={team1Id} onValueChange={setTeam1Id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Team 2</label>
                    <Select value={team2Id} onValueChange={setTeam2Id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="block text-sm font-semibold mb-2">Match Date</label>
                  <input
                    type="date"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Course</label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} (Par {course.par})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Holes</label>
                    <Select value={holesToPlay.toString()} onValueChange={(v) => setHolesToPlay(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18">18 Holes</SelectItem>
                        <SelectItem value="9">9 Holes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {holesToPlay === 9 && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Which Nine</label>
                      <Select value={nineSelection} onValueChange={setNineSelection}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="front">Front 9</SelectItem>
                          <SelectItem value="back">Back 9</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tees</label>
                    <Select value={teeSelection} onValueChange={setTeeSelection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Black">Black</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Blue">Blue</SelectItem>
                        <SelectItem value="White">White</SelectItem>
                        <SelectItem value="Red">Red</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Pin Position</label>
                    <Select value={pinPosition} onValueChange={setPinPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Novice">Novice</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Stimp Rating: {stimpRating}</label>
                  <input
                    type="range"
                    min="7"
                    max="12"
                    step="0.5"
                    value={stimpRating}
                    onChange={(e) => setStimpRating(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>7 (Slow)</span>
                    <span>12 (Fast)</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Adding Match...' : 'Add Match'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href={`/leagues/${leagueId}/schedule`}>
            <Button variant="outline">
              ← Back to Schedule
            </Button>
          </Link>
          {weekNumber > 1 && (
            <Link href={`/leagues/${leagueId}/schedule/week/${weekNumber - 1}`}>
              <Button variant="outline">
                ← Previous Week
              </Button>
            </Link>
          )}
          <Link href={`/leagues/${leagueId}/schedule/week/${weekNumber + 1}`}>
            <Button>
              Next Week →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
