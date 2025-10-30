'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Hole {
  id: string;
  hole_number: number;
  par: number;
  handicap_index: number;
  yardage?: number;
  yardage_black?: number;
  yardage_gold?: number;
  yardage_blue?: number;
  yardage_white?: number;
  yardage_red?: number;
}

interface Course {
  id: string;
  name: string;
  location?: string;
  par: number;
  architect?: string;
  year_opened?: number;
  total_holes: number;
  holes: Hole[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  }

  function getTotalYardage(course: Course, tee: string = 'blue'): number {
    return course.holes.reduce((sum, hole) => {
      let yardage = 0;
      switch (tee.toLowerCase()) {
        case 'black':
          yardage = hole.yardage_black || hole.yardage || 0;
          break;
        case 'gold':
          yardage = hole.yardage_gold || hole.yardage || 0;
          break;
        case 'blue':
          yardage = hole.yardage_blue || hole.yardage || 0;
          break;
        case 'white':
          yardage = hole.yardage_white || hole.yardage || 0;
          break;
        case 'red':
          yardage = hole.yardage_red || hole.yardage || 0;
          break;
        default:
          yardage = hole.yardage || 0;
      }
      return sum + yardage;
    }, 0);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Golf Courses
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse available courses or add a new one
            </p>
          </div>
          <Link href="/courses/new">
            <Button className="bg-green-600 hover:bg-green-700">
              + Add New Course
            </Button>
          </Link>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No courses available yet.
              </p>
              <Link href="/courses/new">
                <Button>Add Your First Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{course.name}</CardTitle>
                      {course.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          📍 {course.location}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="font-semibold">
                      Par {course.par}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Holes:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {course.total_holes}
                      </span>
                    </div>
                    {course.architect && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Architect:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {course.architect}
                        </span>
                      </div>
                    )}
                    {course.year_opened && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Year Opened:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {course.year_opened}
                        </span>
                      </div>
                    )}
                    {course.holes.length > 0 && (
                      <div className="border-t pt-3 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Yardage by Tee:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {getTotalYardage(course, 'black') > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">Black:</span>
                              <span className="font-semibold">{getTotalYardage(course, 'black')}</span>
                            </div>
                          )}
                          {getTotalYardage(course, 'gold') > 0 && (
                            <div className="flex justify-between">
                              <span className="text-yellow-600 dark:text-yellow-400">Gold:</span>
                              <span className="font-semibold">{getTotalYardage(course, 'gold')}</span>
                            </div>
                          )}
                          {getTotalYardage(course, 'blue') > 0 && (
                            <div className="flex justify-between">
                              <span className="text-blue-600 dark:text-blue-400">Blue:</span>
                              <span className="font-semibold">{getTotalYardage(course, 'blue')}</span>
                            </div>
                          )}
                          {getTotalYardage(course, 'white') > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">White:</span>
                              <span className="font-semibold">{getTotalYardage(course, 'white')}</span>
                            </div>
                          )}
                          {getTotalYardage(course, 'red') > 0 && (
                            <div className="flex justify-between">
                              <span className="text-red-600 dark:text-red-400">Red:</span>
                              <span className="font-semibold">{getTotalYardage(course, 'red')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedCourse(
                          expandedCourse === course.id ? null : course.id
                        )
                      }
                      className="w-full"
                    >
                      {expandedCourse === course.id ? 'Hide' : 'View'} Hole Details
                    </Button>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="mt-4 border-t pt-4 dark:border-gray-700">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b dark:border-gray-700">
                              <th className="text-left py-2">Hole</th>
                              <th className="text-center py-2">Par</th>
                              <th className="text-center py-2">HCP</th>
                              <th className="text-right py-2">Blue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {course.holes
                              .sort((a, b) => a.hole_number - b.hole_number)
                              .map((hole) => (
                                <tr
                                  key={hole.id}
                                  className="border-b dark:border-gray-700"
                                >
                                  <td className="py-2 font-semibold">{hole.hole_number}</td>
                                  <td className="text-center py-2">{hole.par}</td>
                                  <td className="text-center py-2">{hole.handicap_index}</td>
                                  <td className="text-right py-2">
                                    {hole.yardage_blue || hole.yardage || '-'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
