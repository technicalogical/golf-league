'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Team {
  id: string;
  name: string;
  captain_id: string | null;
  open_to_join: boolean;
  created_at: string;
  captain?: {
    name: string;
    email: string;
  };
  member_count: number;
  league_count: number;
}

export default function AdminTeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    const filtered = teams.filter(
      (team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.captain?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(filtered);
  }, [searchTerm, teams]);

  async function loadTeams() {
    try {
      const response = await fetch('/api/admin/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
        setFilteredTeams(data);
      } else {
        alert('Failed to load teams');
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      alert('Error loading teams');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!teamToDelete || confirmName !== teamToDelete.name) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/teams/${teamToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTeams(teams.filter((t) => t.id !== teamToDelete.id));
        setDeleteDialogOpen(false);
        setTeamToDelete(null);
        setConfirmName('');
      } else {
        const error = await response.json();
        alert(`Failed to delete team: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team');
    } finally {
      setDeleting(false);
    }
  }

  function openDeleteDialog(team: Team) {
    setTeamToDelete(team);
    setConfirmName('');
    setDeleteDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Teams
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View, edit, and delete teams
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">← Back to Admin</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Teams ({filteredTeams.length})</CardTitle>
            <div className="mt-4">
              <Input
                placeholder="Search by team name or captain..."
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
                  <TableHead>Team Name</TableHead>
                  <TableHead>Captain</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Leagues</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      {team.captain ? (
                        <div>
                          <div>{team.captain.name}</div>
                          <div className="text-xs text-gray-500">{team.captain.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No captain</span>
                      )}
                    </TableCell>
                    <TableCell>{team.member_count}</TableCell>
                    <TableCell>{team.league_count}</TableCell>
                    <TableCell>
                      {team.open_to_join ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Closed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(team.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/teams/${team.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(team)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTeams.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No teams found matching your search.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the team and remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All team members</li>
                <li>All player records associated with this team</li>
                <li>Team from all leagues</li>
                <li>All matches involving this team</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Please type <strong>{teamToDelete?.name}</strong> to confirm:
              </p>
              <Input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Team name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTeamToDelete(null);
                setConfirmName('');
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmName !== teamToDelete?.name || deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}