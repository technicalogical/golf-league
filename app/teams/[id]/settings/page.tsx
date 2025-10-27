'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  open_to_join: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface TeamSettings {
  id: string;
  name: string;
  max_members: number;
  open_to_join: boolean;
  is_active: boolean;
}

export default function TeamSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<TeamSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      open_to_join: false,
    },
  });

  const openToJoin = form.watch('open_to_join');

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  async function loadTeam() {
    try {
      const response = await fetch(`/api/teams/${teamId}/settings`);
      const data = await response.json();

      if (response.ok) {
        setTeam(data);

        // Reset form with loaded data
        form.reset({
          open_to_join: data.open_to_join || false,
        });
      } else {
        setError(data.error || 'Failed to load team settings');
      }
    } catch (err) {
      console.error('Error loading team:', err);
      setError('Failed to load team settings');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: FormData) {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/teams/${teamId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          open_to_join: data.open_to_join,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update settings');
      }

      setSuccess('Settings updated successfully!');
      setTimeout(() => {
        router.push(`/teams/${teamId}`);
      }, 1000);
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

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Team Not Found</h1>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              ← Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href={`/teams/${teamId}`}>
              ← Back to Team
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{team.name}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Join Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="open_to_join"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Open Team</FormLabel>
                        <FormDescription>
                          Allow anyone to join your team without an invite code
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {openToJoin ? (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-900">
                      <h3 className="font-semibold mb-2">✓ Open Team</h3>
                      <p className="text-sm text-green-800">
                        Your team will appear in the "Browse Teams" list and anyone can join without needing an invite code.
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-900">
                      <h3 className="font-semibold mb-2">🔒 Private Team</h3>
                      <p className="text-sm text-blue-800">
                        Only people with your invite code can join this team. Your team won't appear in public listings.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

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
                <Link href={`/teams/${teamId}`}>
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
