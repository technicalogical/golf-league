'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface User {
  id: string;
  name: string;
  email: string;
  display_name?: string;
  is_site_admin: boolean;
  created_at: string;
  updated_at?: string;
  teams_count: number;
  leagues_count: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  async function loadUsers() {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } else {
        alert('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading users');
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdminStatus(userId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/admin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_site_admin: !currentStatus }),
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, is_site_admin: !currentStatus }
            : user
        ));
      } else {
        const error = await response.json();
        alert(`Failed to update admin status: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert('Error updating admin status');
    }
  }

  function openDeleteDialog(user: User) {
    setUserToDelete(user);
    setConfirmEmail('');
    setDeleteDialogOpen(true);
  }

  async function handleDeleteUser() {
    if (!userToDelete || confirmEmail !== userToDelete.email) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setConfirmEmail('');
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Users
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View users and manage admin permissions
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">← Back to Admin</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <div className="mt-4">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Leagues</TableHead>
                  <TableHead>Site Admin</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.display_name || user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.teams_count}</TableCell>
                    <TableCell>{user.leagues_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_site_admin}
                          onCheckedChange={() => toggleAdminStatus(user.id, user.is_site_admin)}
                        />
                        {user.is_site_admin && (
                          <Badge variant="destructive" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.updated_at
                        ? new Date(user.updated_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                        disabled={user.is_site_admin}
                      >
                        Delete User
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your search.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the user account
                and remove all associated data including teams, leagues, matches, and scorecards.
              </DialogDescription>
            </DialogHeader>

            {userToDelete && (
              <div className="py-4">
                <p className="mb-4">
                  You are about to delete: <strong>{userToDelete.name || userToDelete.email}</strong>
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  This user is in {userToDelete.teams_count} teams and {userToDelete.leagues_count} leagues.
                </p>
                <div className="space-y-2">
                  <label htmlFor="confirmEmail" className="text-sm font-medium">
                    To confirm, type the user's email address:
                  </label>
                  <Input
                    id="confirmEmail"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder={userToDelete.email}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleting || confirmEmail !== userToDelete?.email}
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}