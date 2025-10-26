'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSkip() {
    setIsSubmitting(true);
    setError('');

    // Validate display name is provided even when skipping optional fields
    if (!displayName.trim()) {
      setError('Display name is required. You can skip bio, phone, and privacy settings.');
      setIsSubmitting(false);
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
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate display name is provided
    if (!displayName.trim()) {
      setError('Display name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio,
          phone: phone,
          show_email: showEmail,
          show_phone: showPhone,
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
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⛳</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Golf League!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Let's set up your profile to get started
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Display Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This name will be displayed throughout the site
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Bio <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little about yourself..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Phone Number <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Privacy Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Privacy Preferences</h3>

              <div className="space-y-3">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEmail}
                    onChange={(e) => setShowEmail(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Show my email to other users</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      League admins can always see your email
                    </p>
                  </div>
                </label>

                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPhone}
                    onChange={(e) => setShowPhone(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Show my phone to other users</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip optional fields
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              You can always update your profile later from the dashboard
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
