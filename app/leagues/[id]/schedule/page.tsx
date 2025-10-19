'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface GeneratedMatch {
  team1_id: string;
  team2_id: string;
  week_number: number;
  team1_name?: string;
  team2_name?: string;
}

interface WeekConfig {
  week_number: number;
  date: string;
  course_id: string;
  holes_to_play: number;
  nine_selection: string;
  tee_selection: string;
  pin_position: string;
  stimp_rating: string;
  is_skipped: boolean;
  is_playoff: boolean;
  notes: string;
}

export default function GenerateSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfWeeks, setNumberOfWeeks] = useState<number>(10);
  const [scheduleType, setScheduleType] = useState<string>('random'); // 'random' or 'round-robin'
  const [defaultHoles, setDefaultHoles] = useState<number>(18);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedMatch[]>([]);
  const [weekConfigs, setWeekConfigs] = useState<WeekConfig[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function generateRandomSchedule(teamsList: Team[], weeks: number): GeneratedMatch[] {
    if (teamsList.length < 2) {
      return [];
    }

    const schedule: GeneratedMatch[] = [];
    const matchHistory: Set<string> = new Set(); // Track who has played whom

    // Helper to create a unique match key
    const getMatchKey = (team1Id: string, team2Id: string) => {
      return [team1Id, team2Id].sort().join('-');
    };

    // For each week
    for (let week = 1; week <= weeks; week++) {
      const availableTeams = [...teamsList];
      const weekMatches: GeneratedMatch[] = [];

      // Try to create as many matches as possible this week
      while (availableTeams.length >= 2) {
        // Pick first team
        const team1Index = Math.floor(Math.random() * availableTeams.length);
        const team1 = availableTeams.splice(team1Index, 1)[0];

        // Try to find an opponent they haven't played yet
        let team2Index = -1;
        let foundNewOpponent = false;

        // First pass: try to find someone they haven't played
        for (let i = 0; i < availableTeams.length; i++) {
          const matchKey = getMatchKey(team1.id, availableTeams[i].id);
          if (!matchHistory.has(matchKey)) {
            team2Index = i;
            foundNewOpponent = true;
            break;
          }
        }

        // Second pass: if everyone has been played, just pick randomly
        if (!foundNewOpponent && availableTeams.length > 0) {
          team2Index = Math.floor(Math.random() * availableTeams.length);
        }

        if (team2Index !== -1) {
          const team2 = availableTeams.splice(team2Index, 1)[0];
          const matchKey = getMatchKey(team1.id, team2.id);
          matchHistory.add(matchKey);

          weekMatches.push({
            team1_id: team1.id,
            team2_id: team2.id,
            week_number: week,
            team1_name: team1.name,
            team2_name: team2.name,
          });
        }
      }

      schedule.push(...weekMatches);
    }

    return schedule;
  }

  function generateRoundRobin(teamsList: Team[]): GeneratedMatch[] {
    if (teamsList.length < 2) {
      return [];
    }

    const teams = [...teamsList];
    const isOdd = teams.length % 2 === 1;

    // Add a "BYE" team if odd number of teams
    if (isOdd) {
      teams.push({ id: 'BYE', name: 'BYE' });
    }

    const n = teams.length;
    const rounds = n - 1;
    const matchesPerRound = n / 2;
    const schedule: GeneratedMatch[] = [];

    // Round-robin algorithm (circle method)
    for (let round = 0; round < rounds; round++) {
      const weekNumber = round + 1;

      for (let match = 0; match < matchesPerRound; match++) {
        let home, away;

        if (match === 0) {
          home = 0;
          away = n - 1;
        } else {
          home = match;
          away = n - match - 1;
        }

        // Rotate teams (except first team stays fixed)
        const homeIndex = (home + round) % (n - 1);
        const awayIndex = (away + round) % (n - 1);

        const team1 = home === 0 ? teams[0] : teams[homeIndex + 1];
        const team2 = away === 0 ? teams[0] : teams[awayIndex + 1];

        // Skip BYE matches
        if (team1.id !== 'BYE' && team2.id !== 'BYE') {
          schedule.push({
            team1_id: team1.id,
            team2_id: team2.id,
            week_number: weekNumber,
            team1_name: team1.name,
            team2_name: team2.name,
          });
        }
      }
    }

    // If double round-robin, add reverse fixtures
    if (doubleRoundRobin) {
      const secondHalf = schedule.map(match => ({
        team1_id: match.team2_id,
        team2_id: match.team1_id,
        week_number: match.week_number + rounds,
        team1_name: match.team2_name,
        team2_name: match.team1_name,
      }));
      return [...schedule, ...secondHalf];
    }

    return schedule;
  }

  function handleGenerate() {
    setError('');
    setSuccess('');
    setIsGenerating(true);

    try {
      // First, create initial week configurations
      const startDateObj = startDate ? new Date(startDate) : new Date();
      const endDateObj = endDate ? new Date(endDate) : null;
      const defaultCourseId = courses.length > 0 ? courses[0].id : '';

      // Calculate number of weeks from start to end date
      let totalWeeks = numberOfWeeks;
      if (startDateObj && endDateObj) {
        const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
        totalWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      }

      const configs: WeekConfig[] = [];
      for (let week = 1; week <= totalWeeks; week++) {
        const weekDate = new Date(startDateObj);
        weekDate.setDate(startDateObj.getDate() + (week - 1) * 7);

        configs.push({
          week_number: week,
          date: weekDate.toISOString().split('T')[0],
          course_id: defaultCourseId,
          holes_to_play: defaultHoles,
          nine_selection: 'front',
          tee_selection: 'Blue',
          pin_position: 'Intermediate',
          stimp_rating: '10',
          is_skipped: false,
          is_playoff: false,
          notes: '',
        });
      }

      setWeekConfigs(configs);

      // Generate matches and map them to regular weeks only
      let schedule: GeneratedMatch[] = [];
      if (scheduleType === 'random') {
        // Count only regular weeks (not skipped, not playoff)
        const regularWeeks = configs.filter(c => !c.is_skipped && !c.is_playoff);
        const regularWeekNumbers = regularWeeks.map(w => w.week_number);

        // Generate matches for the number of regular weeks
        const rawSchedule = generateRandomSchedule(teams, regularWeeks.length);

        // Map generated matches to actual week numbers (skipping skipped/playoff weeks)
        schedule = rawSchedule.map((match, index) => {
          const actualWeekNumber = regularWeekNumbers[match.week_number - 1] || match.week_number;
          return {
            ...match,
            week_number: actualWeekNumber,
          };
        });
      } else {
        schedule = generateRoundRobin(teams);
      }

      setGeneratedSchedule(schedule);
      setCurrentStep(2);
      setSuccess(`Generated ${schedule.length} matches across ${totalWeeks} weeks. Now configure each week.`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  }

  function updateWeekConfig(weekNumber: number, field: keyof WeekConfig, value: any) {
    setWeekConfigs(prev =>
      prev.map(config =>
        config.week_number === weekNumber
          ? { ...config, [field]: value }
          : config
      )
    );
  }

  function handleRegenerateMatches() {
    setError('');
    setSuccess('');

    try {
      // Only regenerate for random scheduling
      if (scheduleType !== 'random') {
        setError('Match regeneration is only available for random scheduling');
        return;
      }

      // Get regular weeks (not skipped, not playoff)
      const regularWeeks = weekConfigs.filter(c => !c.is_skipped && !c.is_playoff);
      const regularWeekNumbers = regularWeeks.map(w => w.week_number);

      // Generate new random matches
      const rawSchedule = generateRandomSchedule(teams, regularWeeks.length);

      // Map generated matches to actual week numbers
      const schedule = rawSchedule.map((match) => {
        const actualWeekNumber = regularWeekNumbers[match.week_number - 1] || match.week_number;
        return {
          ...match,
          week_number: actualWeekNumber,
        };
      });

      setGeneratedSchedule(schedule);
      setSuccess(`Regenerated ${schedule.length} matches for ${regularWeeks.length} regular weeks`);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate matches');
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (generatedSchedule.length === 0) {
      setError('Please generate a schedule first');
      setIsSubmitting(false);
      return;
    }

    // Validate all non-skipped weeks have dates and courses
    const invalidWeeks = weekConfigs.filter(
      w => !w.is_skipped && (!w.date || !w.course_id)
    );
    if (invalidWeeks.length > 0) {
      setError('All non-skipped weeks must have a date and course selected');
      setIsSubmitting(false);
      return;
    }

    try {
      // Apply week configurations to matches
      const matchesWithConfig = generatedSchedule
        .map(match => {
          const weekConfig = weekConfigs.find(w => w.week_number === match.week_number);
          if (!weekConfig || weekConfig.is_skipped) {
            return null;
          }

          return {
            ...match,
            date: weekConfig.date,
            course_id: weekConfig.course_id,
            holes_to_play: weekConfig.holes_to_play,
            nine_selection: weekConfig.holes_to_play === 9 ? weekConfig.nine_selection : null,
            tee_selection: weekConfig.tee_selection,
            pin_position: weekConfig.pin_position,
            stimp_rating: weekConfig.stimp_rating,
            is_playoff: weekConfig.is_playoff,
            notes: weekConfig.notes,
          };
        })
        .filter(m => m !== null);

      const response = await fetch(`/api/leagues/${leagueId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule: matchesWithConfig,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create schedule');
      }

      setSuccess('Schedule created successfully!');
      setTimeout(() => {
        router.push(`/leagues/${leagueId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
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

  if (teams.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <Link href={`/leagues/${leagueId}`} className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
              ← Back to League
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Generate Schedule</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">
              You need at least 2 teams in the league to generate a schedule.
            </p>
            <Link href={`/leagues/${leagueId}/teams/add`} className="text-blue-600 hover:text-blue-800 font-semibold">
              Add Teams to League
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Group matches by week for display
  const matchesByWeek: { [key: number]: GeneratedMatch[] } = {};
  generatedSchedule.forEach(match => {
    if (!matchesByWeek[match.week_number]) {
      matchesByWeek[match.week_number] = [];
    }
    matchesByWeek[match.week_number].push(match);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href={`/leagues/${leagueId}`} className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to League
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Generate Schedule</h1>

          {/* Step Indicator */}
          <div className="mt-4 flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                {currentStep === 1 ? '1' : '✓'}
              </div>
              <span className="font-semibold">Generate Pairings</span>
            </div>
            <div className="h-0.5 w-16 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="font-semibold">Configure Weeks</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Step 1: Generate Pairings */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Step 1: Generate Match Pairings</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Teams in league: <strong>{teams.length}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Schedule Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-start">
                    <input
                      type="radio"
                      value="random"
                      checked={scheduleType === 'random'}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Random Matchups</span>
                      <p className="text-xs text-gray-500">
                        Randomly pair teams each week. Great for flexible schedules and odd numbers of teams.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="radio"
                      value="round-robin"
                      checked={scheduleType === 'round-robin'}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Round-Robin</span>
                      <p className="text-xs text-gray-500">
                        Each team plays every other team once. Requires specific number of weeks.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {scheduleType === 'random' && (
                <div>
                  <label htmlFor="numberOfWeeks" className="block text-sm font-semibold text-gray-900 mb-2">
                    Number of Weeks
                  </label>
                  <input
                    type="number"
                    id="numberOfWeeks"
                    min="1"
                    max="52"
                    value={numberOfWeeks}
                    onChange={(e) => setNumberOfWeeks(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    With {teams.length} teams, you can have {Math.floor(teams.length / 2)} matches per week
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-2">
                    Season Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900 mb-2">
                    Season End Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="default_holes" className="block text-sm font-semibold text-gray-900 mb-2">
                  Default Holes per Round
                </label>
                <select
                  id="default_holes"
                  value={defaultHoles}
                  onChange={(e) => setDefaultHoles(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="18">18 Holes</option>
                  <option value="9">9 Holes</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  You can adjust course, tees, pins, and other settings per week in the next step
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Match Pairings →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure Weeks */}
        {currentStep === 2 && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Step 2: Configure Week Details</h2>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to Step 1
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Configure each week's details. You can skip weeks (holidays), mark playoff weeks, or change courses per week.
              </p>

              {scheduleType === 'random' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    After marking weeks as "Skip Week" or "Playoff Week", click the button below to regenerate matches only for regular play weeks.
                  </p>
                  <button
                    onClick={handleRegenerateMatches}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                  >
                    Regenerate Matches for Regular Weeks
                  </button>
                </div>
              )}

              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {weekConfigs.map((config) => {
                  const weekMatches = matchesByWeek[config.week_number] || [];

                  return (
                    <div
                      key={config.week_number}
                      className={`p-4 rounded-lg border-2 ${
                        config.is_skipped
                          ? 'bg-gray-50 border-gray-300'
                          : config.is_playoff
                          ? 'bg-yellow-50 border-yellow-400'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                            <h3 className="font-bold text-gray-900 text-lg">Week {config.week_number}</h3>
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={config.is_skipped}
                                onChange={(e) => updateWeekConfig(config.week_number, 'is_skipped', e.target.checked)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mr-2"
                              />
                              Skip Week
                            </label>
                            {!config.is_skipped && (
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  checked={config.is_playoff}
                                  onChange={(e) => updateWeekConfig(config.week_number, 'is_playoff', e.target.checked)}
                                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 mr-2"
                                />
                                Playoff Week
                              </label>
                            )}
                          </div>

                          {!config.is_skipped && (
                            <>
                              <div className="grid md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    value={config.date}
                                    onChange={(e) => updateWeekConfig(config.week_number, 'date', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Course
                                  </label>
                                  <select
                                    value={config.course_id}
                                    onChange={(e) => updateWeekConfig(config.week_number, 'course_id', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    {courses.map((course) => (
                                      <option key={course.id} value={course.id}>
                                        {course.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Holes
                                  </label>
                                  <select
                                    value={config.holes_to_play}
                                    onChange={(e) => updateWeekConfig(config.week_number, 'holes_to_play', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="18">18 Holes</option>
                                    <option value="9">9 Holes</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-4 gap-3">
                                {config.holes_to_play === 9 && (
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                      Which Nine
                                    </label>
                                    <select
                                      value={config.nine_selection}
                                      onChange={(e) => updateWeekConfig(config.week_number, 'nine_selection', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="front">Front 9</option>
                                      <option value="back">Back 9</option>
                                    </select>
                                  </div>
                                )}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Tees
                                  </label>
                                  <select
                                    value={config.tee_selection}
                                    onChange={(e) => updateWeekConfig(config.week_number, 'tee_selection', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="Black">Black</option>
                                    <option value="Gold">Gold</option>
                                    <option value="Blue">Blue</option>
                                    <option value="White">White</option>
                                    <option value="Red">Red</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Pin Position
                                  </label>
                                  <select
                                    value={config.pin_position}
                                    onChange={(e) => updateWeekConfig(config.week_number, 'pin_position', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="Novice">Novice</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Stimp Rating
                                  </label>
                                  <select
                                    value={config.stimp_rating}
                                    onChange={(e) => updateWeekConfig(config.week_number, 'stimp_rating', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="7">7 (Slow)</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10 (Medium)</option>
                                    <option value="11">11</option>
                                    <option value="12">12 (Fast)</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Notes (optional)
                                </label>
                                <input
                                  type="text"
                                  value={config.notes}
                                  onChange={(e) => updateWeekConfig(config.week_number, 'notes', e.target.value)}
                                  placeholder="e.g., Championship round, makeup week, etc."
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div className="text-xs text-gray-600">
                                <strong>Matches ({weekMatches.length}):</strong>{' '}
                                {weekMatches.length > 0 ? (
                                  weekMatches.map((m, i) => (
                                    <span key={i}>
                                      {m.team1_name} vs {m.team2_name}
                                      {i < weekMatches.length - 1 && ', '}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-500 italic">
                                    {config.is_playoff
                                      ? 'No regular matches (playoff week)'
                                      : 'No matches scheduled'}
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          {config.is_skipped && (
                            <p className="text-sm text-gray-500 italic">
                              This week will be skipped - no matches will be created
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Schedule...' : 'Create Schedule'}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
