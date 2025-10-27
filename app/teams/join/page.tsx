'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  invite_code: z.string()
    .length(8, 'Invite code must be exactly 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Invite code must contain only uppercase letters and numbers'),
});

type FormData = z.infer<typeof formSchema>;

export default function JoinTeamPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invite_code: '',
    },
  });

  async function onSubmit(data: FormData) {
    setError('');

    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invite_code: data.invite_code.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to join team');
      }

      const responseData = await response.json();
      router.push(`/teams/${responseData.team_id}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/dashboard">
              ← Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join a Team</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Enter Invite Code</CardTitle>
            <CardDescription>
              Enter the invite code provided by your team captain to join their team.
            </CardDescription>
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
                  name="invite_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABCD1234"
                          maxLength={8}
                          className="text-2xl font-mono text-center uppercase"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the 8-character code (not case-sensitive)
                      </FormDescription>
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
                    {form.formState.isSubmitting ? 'Joining Team...' : 'Join Team'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    asChild
                  >
                    <Link href="/dashboard">
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">Don't have an invite code?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
              You can create your own team or ask your team captain for their invite code.
            </p>
            <Button asChild>
              <Link href="/teams/new">
                Create New Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
