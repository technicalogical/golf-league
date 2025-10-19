'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LeagueSettings {
  id: string;
  name: string;
  description: string;
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
}

export default function LeagueSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<LeagueSettings | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leagueDay, setLeagueDay] = useState('');
  const [leagueTime, setLeagueTime] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [landingPageEnabled, setLandingPageEnabled] = useState(false);
  const [leagueInfo, setLeagueInfo] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState('');
  const [customRules, setCustomRules] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLeague();
  }, [leagueId]);

  async function loadLeague() {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/settings`);
      const data = await response.json();

      setLeague(data);
      setName(data.name || '');
      setDescription(data.description || '');
      setLeagueDay(data.day_of_week || data.league_day || '');
      setLeagueTime(data.time_of_day || data.league_time || '');
      setIsPublic(data.is_public || false);
      setLandingPageEnabled(data.landing_page_enabled || false);
      setLeagueInfo(data.league_info || '');
      setContactName(data.contact_name || '');
      setContactEmail(data.contact_email || '');
      setContactPhone(data.contact_phone || '');
      setRegistrationOpen(data.registration_open || false);
      setRegistrationInfo(data.registration_info || '');
      setCustomRules(data.custom_rules || '');
    } catch (err) {
      console.error('Error loading league:', err);
      setError('Failed to load league settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/leagues/${leagueId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          league_day: leagueDay,
          league_time: leagueTime,
          is_public: isPublic,
          landing_page_enabled: landingPageEnabled,
          league_info: leagueInfo,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          registration_open: registrationOpen,
          registration_info: registrationInfo,
          custom_rules: customRules,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update league settings');
      }

      setSuccess('League settings updated successfully!');

      // Redirect to landing page if enabled, otherwise reload
      if (landingPageEnabled) {
        setTimeout(() => {
          router.push(`/leagues/${leagueId}/public`);
        }, 1000);
      } else {
        loadLeague();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={`/leagues/${leagueId}`}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 block"
          >
            ← Back to League
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">League Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  League Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  Short Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="leagueDay" className="block text-sm font-semibold text-gray-900 mb-2">
                    League Day
                  </label>
                  <select
                    id="leagueDay"
                    value={leagueDay}
                    onChange={(e) => setLeagueDay(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select day...</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="leagueTime" className="block text-sm font-semibold text-gray-900 mb-2">
                    League Time
                  </label>
                  <input
                    type="time"
                    id="leagueTime"
                    value={leagueTime}
                    onChange={(e) => setLeagueTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Visibility Settings</h2>

            <div className="space-y-4">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-900">Public League</span>
                  <p className="text-xs text-gray-500">
                    Allow non-members to view league information and standings
                  </p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={landingPageEnabled}
                  onChange={(e) => setLandingPageEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-semibold text-gray-900">Enable Landing Page</span>
                  <p className="text-xs text-gray-500">
                    Create a public landing page with league information and contact details
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Landing Page Content */}
          {landingPageEnabled && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Landing Page Content</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="league_info" className="block text-sm font-semibold text-gray-900 mb-2">
                    League Information
                  </label>
                  <textarea
                    id="league_info"
                    value={leagueInfo}
                    onChange={(e) => setLeagueInfo(e.target.value)}
                    rows={4}
                    placeholder="Describe your league, when it meets, skill level, etc..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="custom_rules" className="block text-sm font-semibold text-gray-900 mb-2">
                    League Rules & Guidelines
                  </label>
                  <textarea
                    id="custom_rules"
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    rows={4}
                    placeholder="List any special rules, scoring systems, or guidelines..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {landingPageEnabled && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="contact_name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="contact_name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="contact_email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contact_phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Registration Settings */}
          {landingPageEnabled && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Registration</h2>

              <div className="space-y-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={registrationOpen}
                    onChange={(e) => setRegistrationOpen(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-semibold text-gray-900">Registration Open</span>
                    <p className="text-xs text-gray-500">
                      Show that the league is accepting new members
                    </p>
                  </div>
                </label>

                <div>
                  <label htmlFor="registration_info" className="block text-sm font-semibold text-gray-900 mb-2">
                    Registration Instructions
                  </label>
                  <textarea
                    id="registration_info"
                    value={registrationInfo}
                    onChange={(e) => setRegistrationInfo(e.target.value)}
                    rows={3}
                    placeholder="How can people join? Include any requirements, fees, or steps..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
              {success}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
            <Link
              href={`/leagues/${leagueId}`}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-center"
            >
              Cancel
            </Link>
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
      </main>
    </div>
  );
}
