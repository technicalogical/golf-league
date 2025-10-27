'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  show_email: z.boolean().default(false),
  show_phone: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function WelcomePage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display_name: '',
      bio: '',
      phone: '',
      show_email: false,
      show_phone: false,
    },
  });

  async function handleSkip() {
    setError('');

    // Validate display name is provided even when skipping optional fields
    const displayName = form.getValues('display_name');
    if (!displayName.trim()) {
      setError('Display name is required. You can skip bio, phone, and privacy settings.');
      return;
    }

    try {
      // Save only the display name and mark onboarding as completed
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          complete_onboarding: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function onSubmit(data: FormData) {
    setError('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: data.display_name.trim(),
          bio: data.bio,
          phone: data.phone,
          show_email: data.show_email,
          show_phone: data.show_phone,
          complete_onboarding: true,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update profile');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="text-6xl mb-4">⛳</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Golf League!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Let's set up your profile to get started
            </p>
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
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Display Name <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="How should we call you?" {...field} />
                      </FormControl>
                      <FormDescription>
                        This name will be displayed throughout the site
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bio <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little about yourself..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Privacy Preferences</h3>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="show_email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Show my email to other users
                            </FormLabel>
                            <FormDescription>
                              League admins can always see your email
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="show_phone"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                              Show my phone to other users
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Setting up...' : 'Complete Setup'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleSkip}
                    disabled={form.formState.isSubmitting}
                  >
                    Skip optional fields
                  </Button>
                </div>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                  You can always update your profile later from the dashboard
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
