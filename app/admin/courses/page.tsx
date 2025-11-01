'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hole {
  id?: string;
  hole_number: number;
  par: number;
  handicap_index: number;
  yardage_black?: number | null;
  yardage_gold?: number | null;
  yardage_blue?: number | null;
  yardage_white?: number | null;
  yardage_red?: number | null;
}

interface Course {
  id: string;
  name: string;
  location?: string | null;
  par: number;
  architect?: string | null;
  year_opened?: number | null;
  total_holes: number;
  holes?: Hole[];
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to load courses');
      const data = await response.json();
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(courseId: string) {
    if (deleteConfirm !== courseId) {
      setDeleteConfirm(courseId);
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course');
      }

      await loadCourses();
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleEdit(course: Course) {
    try {
      // Load full course data with holes
      const response = await fetch(`/api/admin/courses/${course.id}`);
      if (!response.ok) throw new Error('Failed to load course details');
      const fullCourse = await response.json();
      setEditingCourse(fullCourse);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleSave() {
    if (!editingCourse) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCourse),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update course');
      }

      await loadCourses();
      setEditingCourse(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Edit and delete golf courses (Site Admin Only)
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search courses by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Course List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Par
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Holes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {course.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {course.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {course.par}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {course.total_holes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className={`${
                        deleteConfirm === course.id
                          ? 'text-red-700 dark:text-red-400 font-bold'
                          : 'text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400'
                      }`}
                    >
                      {deleteConfirm === course.id ? 'Confirm Delete?' : 'Delete'}
                    </button>
                    {deleteConfirm === course.id && (
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No courses found
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Total courses: {courses.length}
        </div>
      </main>

      {/* Edit Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Course: {editingCourse.name}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Course Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={editingCourse.name}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingCourse.location || ''}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Par
                  </label>
                  <input
                    type="number"
                    value={editingCourse.par}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, par: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Architect
                  </label>
                  <input
                    type="text"
                    value={editingCourse.architect || ''}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, architect: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year Opened
                  </label>
                  <input
                    type="number"
                    value={editingCourse.year_opened || ''}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        year_opened: parseInt(e.target.value) || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Holes Table */}
              {editingCourse.holes && editingCourse.holes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Hole Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            Hole
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            Par
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            HCP
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            Black
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            Gold
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            Blue
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            White
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            Red
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {editingCourse.holes
                          .sort((a, b) => a.hole_number - b.hole_number)
                          .map((hole, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-gray-900 dark:text-white">
                                {hole.hole_number}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={hole.par}
                                  onChange={(e) => {
                                    const newHoles = [...editingCourse.holes!];
                                    newHoles[index].par = parseInt(e.target.value);
                                    setEditingCourse({ ...editingCourse, holes: newHoles });
                                  }}
                                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={hole.handicap_index}
                                  onChange={(e) => {
                                    const newHoles = [...editingCourse.holes!];
                                    newHoles[index].handicap_index = parseInt(e.target.value);
                                    setEditingCourse({ ...editingCourse, holes: newHoles });
                                  }}
                                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={hole.yardage_black || ''}
                                  onChange={(e) => {
                                    const newHoles = [...editingCourse.holes!];
                                    newHoles[index].yardage_black = parseInt(e.target.value) || null;
                                    setEditingCourse({ ...editingCourse, holes: newHoles });
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={hole.yardage_gold || ''}
                                  onChange={(e) => {
                                    const newHoles = [...editingCourse.holes!];
                                    newHoles[index].yardage_gold = parseInt(e.target.value) || null;
                                    setEditingCourse({ ...editingCourse, holes: newHoles });
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={hole.yardage_blue || ''}
                                  onChange={(e) => {
                                    const newHoles = [...editingCourse.holes!];
                                    newHoles[index].yardage_blue = parseInt(e.target.value) || null;
                                    setEditingCourse({ ...editingCourse, holes: newHoles });
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={hole.yardage_white || ''}
                                  onChange={(e) => {
                                    const newHoles = [...editingCourse.holes!];
                                    newHoles[index].yardage_white = parseInt(e.target.value) || null;
                                    setEditingCourse({ ...editingCourse, holes: newHoles });
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={hole.yardage_red || ''}
                                  onChange={(e) => {
                                    const newHoles = [...editingCourse.holes!];
                                    newHoles[index].yardage_red = parseInt(e.target.value) || null;
                                    setEditingCourse({ ...editingCourse, holes: newHoles });
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setEditingCourse(null)}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
