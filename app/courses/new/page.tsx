'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HoleData {
  hole_number: number;
  par: number;
  handicap_index: number;
  yardage_black?: number;
  yardage_gold?: number;
  yardage_blue?: number;
  yardage_white?: number;
  yardage_red?: number;
}

export default function NewCoursePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [architect, setArchitect] = useState('');
  const [yearOpened, setYearOpened] = useState('');
  const [numHoles, setNumHoles] = useState(18);
  const [holes, setHoles] = useState<HoleData[]>(
    Array.from({ length: 18 }, (_, i) => ({
      hole_number: i + 1,
      par: 4,
      handicap_index: i + 1,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function updateNumHoles(newNum: number) {
    setNumHoles(newNum);
    if (newNum > holes.length) {
      // Add new holes
      const newHoles = Array.from({ length: newNum - holes.length }, (_, i) => ({
        hole_number: holes.length + i + 1,
        par: 4,
        handicap_index: holes.length + i + 1,
      }));
      setHoles([...holes, ...newHoles]);
    } else if (newNum < holes.length) {
      // Remove holes
      setHoles(holes.slice(0, newNum));
    }
  }

  function updateHole(index: number, field: keyof HoleData, value: any) {
    const updatedHoles = [...holes];
    updatedHoles[index] = { ...updatedHoles[index], [field]: value };
    setHoles(updatedHoles);
  }

  function fillStandardLayout() {
    // Standard 18-hole layout: Par 72 (4 par 3s, 10 par 4s, 4 par 5s)
    const standardPars = [4, 4, 3, 4, 4, 5, 3, 4, 5, 4, 3, 4, 4, 5, 4, 4, 3, 5];
    const standardHCPs = [9, 5, 15, 3, 11, 1, 17, 7, 13, 10, 18, 4, 12, 2, 14, 6, 16, 8];

    const updatedHoles = holes.map((hole, i) => ({
      ...hole,
      par: standardPars[i] || hole.par,
      handicap_index: standardHCPs[i] || hole.handicap_index,
    }));
    setHoles(updatedHoles);
    setMessage('Applied standard 18-hole layout (Par 72)');
    setTimeout(() => setMessage(''), 3000);
  }

  function calculateTotalPar(): number {
    return holes.reduce((sum, hole) => sum + hole.par, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          location: location || undefined,
          par: calculateTotalPar(),
          architect: architect || undefined,
          year_opened: yearOpened ? parseInt(yearOpened) : undefined,
          holes,
        }),
      });

      if (response.ok) {
        router.push('/courses');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      setMessage('Failed to create course');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Add New Course
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter course details and hole information
            </p>
          </div>
          <Link href="/courses">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        {/* Error/Success Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Failed') || message.includes('error')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Course Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Pebble Beach"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Pebble Beach, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Architect
                  </label>
                  <input
                    type="text"
                    value={architect}
                    onChange={(e) => setArchitect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Jack Neville"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Year Opened
                  </label>
                  <input
                    type="number"
                    value={yearOpened}
                    onChange={(e) => setYearOpened(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 1919"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Number of Holes *
                  </label>
                  <select
                    value={numHoles}
                    onChange={(e) => updateNumHoles(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={9}>9 Holes</option>
                    <option value={18}>18 Holes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Total Par
                  </label>
                  <input
                    type="text"
                    value={calculateTotalPar()}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              {numHoles === 18 && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fillStandardLayout}
                  >
                    Fill Standard Layout (Par 72)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Holes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Hole Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-2 px-2">Hole</th>
                      <th className="text-center py-2 px-2">Par *</th>
                      <th className="text-center py-2 px-2">HCP *</th>
                      <th className="text-center py-2 px-2">Black</th>
                      <th className="text-center py-2 px-2">Gold</th>
                      <th className="text-center py-2 px-2">Blue</th>
                      <th className="text-center py-2 px-2">White</th>
                      <th className="text-center py-2 px-2">Red</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holes.map((hole, index) => (
                      <tr key={index} className="border-b dark:border-gray-700">
                        <td className="py-2 px-2 font-bold">{hole.hole_number}</td>
                        <td className="py-2 px-2">
                          <select
                            value={hole.par}
                            onChange={(e) =>
                              updateHole(index, 'par', parseInt(e.target.value))
                            }
                            required
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                          >
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={hole.handicap_index}
                            onChange={(e) =>
                              updateHole(index, 'handicap_index', parseInt(e.target.value))
                            }
                            required
                            min="1"
                            max="18"
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={hole.yardage_black || ''}
                            onChange={(e) =>
                              updateHole(
                                index,
                                'yardage_black',
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={hole.yardage_gold || ''}
                            onChange={(e) =>
                              updateHole(
                                index,
                                'yardage_gold',
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={hole.yardage_blue || ''}
                            onChange={(e) =>
                              updateHole(
                                index,
                                'yardage_blue',
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={hole.yardage_white || ''}
                            onChange={(e) =>
                              updateHole(
                                index,
                                'yardage_white',
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={hole.yardage_red || ''}
                            onChange={(e) =>
                              updateHole(
                                index,
                                'yardage_red',
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                * Required fields. HCP = Handicap Index (1-18, where 1 is hardest)
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/courses" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Creating Course...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
