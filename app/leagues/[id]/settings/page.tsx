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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(3, 'League name must be at least 3 characters').max(100),
  description: z.string().optional(),
  status: z.enum(['upcoming', 'active', 'ended']),
  league_day: z.string().optional(),
  league_time: z.string().optional(),
  is_public: z.boolean(),
  landing_page_enabled: z.boolean(),
  league_info: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  registration_open: z.boolean(),
  registration_info: z.string().optional(),
  custom_rules: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LeagueSettings {
  id: string;
  name: string;
  description: string;
  status: string;
  league_day: string;
  league_time: string;
  is_public: boolean;
  landing_page_enabled: boolean;
  league_info: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  registration_open: boolean;
  registration_info: string;
  custom_rules: string;
  day_of_week?: string;
  time_of_day?: string;
}

export default function LeagueSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<LeagueSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'upcoming',
      league_day: '',
      league_time: '',
      is_public: false,
      landing_page_enabled: false,
      league_info: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      registration_open: false,
      registration_info: '',
      custom_rules: '',
    },
  });

  const landingPageEnabled = form.watch('landing_page_enabled');

  useEffect(() => {
    loadLeague();
  }, [leagueId]);

  async function loadLeague() {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/settings`);
      const data = await response.json();

      setLeague(data);

      // Reset form with loaded data
      form.reset({
        name: data.name || '',
        description: data.description || '',
        status: data.status || 'upcoming',
        league_day: data.day_of_week || data.league_day || '',
        league_time: data.time_of_day || data.league_time || '',
        is_public: data.is_public || false,
        landing_page_enabled: data.landing_page_enabled || false,
        league_info: data.league_info || '',
        contact_name: data.contact_name || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        registration_open: data.registration_open || false,
        registration_info: data.registration_info || '',
        custom_rules: data.custom_rules || '',
      });
    } catch (err) {
      console.error('Error loading league:', err);
      setError('Failed to load league settings');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: FormData) {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/leagues/${leagueId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          status: data.status,
          league_day: data.league_day,
          league_time: data.league_time,
          is_public: data.is_public,
          landing_page_enabled: data.landing_page_enabled,
          league_info: data.league_info,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          registration_open: data.registration_open,
          registration_info: data.registration_info,
          custom_rules: data.custom_rules,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update league settings');
      }

      setSuccess('League settings updated successfully!');

      // Redirect to landing page if enabled, otherwise reload
      if (data.landing_page_enabled) {
        setTimeout(() => {
          router.push(`/leagues/${leagueId}/public`);
        }, 1000);
      } else {
        loadLeague();
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!league) return;

    if (deleteConfirmText !== league.name) {
      setError('League name does not match. Please type the exact league name to confirm deletion.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/leagues/${leagueId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete league');
      }

      // Redirect to dashboard after successful deletion
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href={`/leagues/${leagueId}`}>
              ← Back to League
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">League Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>League Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Spring 2025 League" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional description of the league..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>League Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="ended">Ended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Set to "Active" during play, "Ended" when the season is over
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="league_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>League Day</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="league_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>League Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Visibility Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Public League</FormLabel>
                        <FormDescription>
                          Allow non-members to view league information and standings
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="landing_page_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Landing Page</FormLabel>
                        <FormDescription>
                          Create a public landing page with league information and contact details
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Landing Page Content */}
            {landingPageEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Landing Page Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="league_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>League Information</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your league, when it meets, skill level, etc..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="custom_rules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>League Rules & Guidelines</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any special rules, scoring systems, or guidelines..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            {landingPageEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Registration Settings */}
            {landingPageEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="registration_open"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Registration Open</FormLabel>
                          <FormDescription>
                            Show that the league is accepting new members
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registration_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How can people join? Include any requirements, fees, or steps..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                asChild
              >
                <Link href={`/leagues/${leagueId}`}>
                  Cancel
                </Link>
              </Button>
            </div>

            {/* Preview Link */}
            {landingPageEnabled && (
              <div className="text-center">
                <Link
                  href={`/leagues/${leagueId}/public`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Preview Public Landing Page →
                </Link>
              </div>
            )}
          </form>
        </Form>

        {/* Danger Zone */}
        <Card className="mt-8 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-800 dark:text-red-300">
              Once you delete a league, there is no going back. This will permanently delete the league,
              all associated teams, matches, and scores. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete This League
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="deleteConfirm" className="block text-sm font-semibold text-red-900 dark:text-red-400 mb-2">
                    Type <span className="font-mono bg-red-100 dark:bg-red-900/40 px-1">{league?.name}</span> to confirm deletion:
                  </label>
                  <Input
                    type="text"
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type league name here"
                    className="border-red-300 focus-visible:ring-red-500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting || deleteConfirmText !== league?.name}
                  >
                    {isDeleting ? 'Deleting...' : 'I understand, delete this league'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
