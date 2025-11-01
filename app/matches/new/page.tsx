'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CourseSelector } from '@/components/course-selector';

const formSchema = z.object({
  team1_id: z.string().min(1, 'Team 1 is required'),
  team2_id: z.string().min(1, 'Team 2 is required'),
  course_id: z.string().min(1, 'Course is required'),
  match_date: z.string().min(1, 'Match date is required'),
  league_id: z.string().optional(),
  holes_to_play: z.number().int().min(9).max(18),
  nine_selection: z.string().optional(),
  tee_selection: z.string().min(1, 'Tee selection is required'),
}).refine((data) => data.team1_id !== data.team2_id, {
  message: 'Please select two different teams',
  path: ['team2_id'],
});

type FormData = z.infer<typeof formSchema>;

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      team1_id: '',
      team2_id: '',
      course_id: '',
      match_date: new Date().toISOString().split('T')[0],
      league_id: '',
      holes_to_play: 18,
      nine_selection: 'front',
      tee_selection: 'Blue',
    },
  });

  const holesToPlay = form.watch('holes_to_play');
  const team1Id = form.watch('team1_id');

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
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load teams and courses');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function onSubmit(data: FormData) {
    setError('');

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1_id: data.team1_id,
          team2_id: data.team2_id,
          course_id: data.course_id,
          match_date: data.match_date,
          league_id: data.league_id || null,
          holes_to_play: data.holes_to_play,
          nine_selection: data.holes_to_play === 9 ? data.nine_selection : null,
          tee_selection: data.tee_selection,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to create match');
      }

      const responseData = await response.json();
      router.push(`/matches/${responseData.id}`);
    } catch (err: any) {
      setError(err.message);
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
            <Button variant="ghost" asChild className="mb-2">
              <Link href="/matches">
                ← Back to Matches
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule New Match</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900 text-center">
            <CardHeader>
              <div className="text-4xl mb-4">⚠️</div>
              <CardTitle>Not Enough Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You need at least 2 active teams to schedule a match.
              </p>
              <Button asChild>
                <Link href="/teams/new">
                  Create Teams
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Button variant="ghost" asChild className="mb-2">
              <Link href="/matches">
                ← Back to Matches
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule New Match</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900 text-center">
            <CardHeader>
              <div className="text-4xl mb-4">⚠️</div>
              <CardTitle>No Courses Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You need to run the database migrations to seed courses.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/matches">
              ← Back to Matches
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule New Match</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="team1_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team 1 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="team2_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team 2 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem
                              key={team.id}
                              value={team.id}
                              disabled={team.id === team1Id}
                            >
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="course_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course *</FormLabel>
                      <FormControl>
                        <CourseSelector
                          courses={courses}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Search or select course..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="match_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Match Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {leagues.length > 0 && (
                  <FormField
                    control={form.control}
                    name="league_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>League (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="None (Friendly Match)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None (Friendly Match)</SelectItem>
                            {leagues.map((league) => (
                              <SelectItem key={league.id} value={league.id}>
                                {league.name} ({league.status})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="holes_to_play"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Holes to Play *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="18">18 Holes</SelectItem>
                          <SelectItem value="9">9 Holes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {holesToPlay === 9 && (
                  <FormField
                    control={form.control}
                    name="nine_selection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Which Nine? *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="front">Front 9 (Holes 1-9)</SelectItem>
                            <SelectItem value="back">Back 9 (Holes 10-18)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="tee_selection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tee Selection *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Black">Black Tees</SelectItem>
                          <SelectItem value="Gold">Gold Tees</SelectItem>
                          <SelectItem value="Blue">Blue Tees (Default)</SelectItem>
                          <SelectItem value="White">White Tees</SelectItem>
                          <SelectItem value="Red">Red Tees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Scheduling...' : 'Schedule Match'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    asChild
                  >
                    <Link href="/matches">
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
