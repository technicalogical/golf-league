'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Slider } from '@/components/ui/slider';
import { CourseSelector } from '@/components/course-selector';

const formSchema = z.object({
  course_id: z.string().min(1, 'Course is required'),
  match_date: z.string().min(1, 'Match date is required'),
  holes_to_play: z.number().int().positive(),
  nine_selection: z.string().optional(),
  tee_selection: z.string().min(1, 'Tee selection is required'),
  stimp_setting: z.number().min(1).max(12),
  pin_placement: z.string().min(1, 'Pin placement is required'),
});

type FormData = z.infer<typeof formSchema>;

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
  stimp_setting: number;
  pin_placement: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_id: '',
      match_date: '',
      holes_to_play: 18,
      nine_selection: 'front',
      tee_selection: 'Blue',
      stimp_setting: 9.0,
      pin_placement: 'Intermediate',
    },
  });

  const holesToPlay = form.watch('holes_to_play');

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

      // Fetch courses
      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      setCourses(coursesData);

      // Reset form with loaded data
      form.reset({
        course_id: matchData.course_id,
        match_date: matchData.match_date,
        holes_to_play: matchData.holes_to_play || 18,
        nine_selection: matchData.nine_selection || 'front',
        tee_selection: matchData.tee_selection || 'Blue',
        stimp_setting: matchData.stimp_setting || 9.0,
        pin_placement: matchData.pin_placement || 'Intermediate',
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load match data');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: FormData) {
    setError('');

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: data.course_id,
          match_date: data.match_date,
          holes_to_play: data.holes_to_play,
          nine_selection: data.holes_to_play === 9 ? data.nine_selection : null,
          tee_selection: data.tee_selection,
          stimp_setting: data.stimp_setting,
          pin_placement: data.pin_placement,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update match');
      }

      router.push(`/matches/${matchId}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Match Not Found</h1>
          <Button variant="ghost" asChild>
            <Link href="/matches">
              ← Back to Matches
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (match.status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Button variant="ghost" asChild className="mb-2">
              <Link href={`/matches/${matchId}`}>
                ← Back to Match
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Match</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cannot Edit Completed Match</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This match has already been completed and cannot be edited.
              </p>
              <Button variant="ghost" asChild>
                <Link href={`/matches/${matchId}`}>
                  ← Back to Match
                </Link>
              </Button>
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
            <Link href={`/matches/${matchId}`}>
              ← Back to Match
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Match</h1>
          {match.team1 && match.team2 && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {match.team1.name} vs {match.team2.name}
            </p>
          )}
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

                <FormField
                  control={form.control}
                  name="holes_to_play"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Holes to Play *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select holes" />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select nine" />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tee" />
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

                <FormField
                  control={form.control}
                  name="stimp_setting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stimp Setting: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={12}
                          step={0.5}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1.0 (Slow)</span>
                        <span>12.0 (Fast)</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pin_placement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pin Placement *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pin placement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Novice">Novice</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
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
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/matches/${matchId}`}>
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
