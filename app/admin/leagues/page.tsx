'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface League {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  registration_open: boolean;
  created_at: string;
  admin_id: string;
  admin: {
    name: string;
    email: string;
  };
  team_count: number;
  member_count: number;
  match_count: number;
}

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<League | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState('');
  const [bulkStatusValue, setBulkStatusValue] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/admin/leagues');
      if (response.ok) {
        const data = await response.json();
        setLeagues(data);
      } else {
        console.error('Failed to fetch leagues');
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeague = (league: League) => {
    setLeagueToDelete(league);
    setDeleteDialogOpen(true);
    setConfirmName('');
  };

  const confirmDelete = async () => {
    if (!leagueToDelete || confirmName !== leagueToDelete.name) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/leagues/${leagueToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeagues(leagues.filter(league => league.id !== leagueToDelete.id));
        setDeleteDialogOpen(false);
        setLeagueToDelete(null);
      } else {
        console.error('Failed to delete league');
      }
    } catch (error) {
      console.error('Error deleting league:', error);
    }
  };

  const toggleLeagueSelection = (leagueId: string) => {
    setSelectedLeagues(prev =>
      prev.includes(leagueId)
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const toggleLeagueStatus = async (leagueId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLeagues(leagues.map(league =>
          league.id === leagueId
            ? { ...league, status: newStatus }
            : league
        ));
      }
    } catch (error) {
      console.error('Error updating league status:', error);
    }
  };

  const executeBulkOperation = async () => {
    if (!bulkOperation || selectedLeagues.length === 0) return;

    setProcessing(true);
    try {
      let operationData = {};

      switch (bulkOperation) {
        case 'activate':
          operationData = { status: 'active' };
          break;
        case 'deactivate':
          operationData = { status: 'inactive' };
          break;
        case 'setStatus':
          operationData = { status: bulkStatusValue };
          break;
        case 'makePublic':
          operationData = { is_public: true };
          break;
        case 'makePrivate':
          operationData = { is_public: false };
          break;
        case 'openRegistration':
          operationData = { registration_open: true };
          break;
        case 'closeRegistration':
          operationData = { registration_open: false };
          break;
      }

      const operation = bulkOperation === 'activate' || bulkOperation === 'deactivate' || bulkOperation === 'setStatus'
        ? 'updateStatus'
        : bulkOperation === 'makePublic' || bulkOperation === 'makePrivate'
        ? 'updateVisibility'
        : bulkOperation === 'openRegistration' || bulkOperation === 'closeRegistration'
        ? 'updateRegistration'
        : bulkOperation === 'delete'
        ? 'delete'
        : '';

      const response = await fetch('/api/admin/leagues/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          leagueIds: selectedLeagues,
          data: operationData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bulk operation result:', result);

        // Refresh the leagues list
        await fetchLeagues();

        // Clear selection and close dialog
        setSelectedLeagues([]);
        setBulkOperationsOpen(false);
        setBulkOperation('');
        setBulkStatusValue('');
      } else {
        console.error('Bulk operation failed');
      }
    } catch (error) {
      console.error('Error executing bulk operation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading leagues...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              League Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all leagues, settings, and operations
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">← Back to Admin</Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{leagues.length}</div>
              <p className="text-xs text-muted-foreground">Total Leagues</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {leagues.filter(l => l.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {leagues.filter(l => l.status === 'inactive').length}
              </div>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {leagues.reduce((sum, league) => sum + league.team_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Teams</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {leagues.reduce((sum, league) => sum + league.member_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {leagues.reduce((sum, league) => sum + league.match_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total Matches</p>
            </CardContent>
          </Card>
        </div>

        {/* Health Checks */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>League Health Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Empty Leagues</h4>
                  <div className="text-2xl font-bold text-orange-600">
                    {leagues.filter(l => l.team_count === 0).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leagues with no teams
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Low Activity</h4>
                  <div className="text-2xl font-bold text-yellow-600">
                    {leagues.filter(l => l.match_count === 0 && l.team_count > 0).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leagues with teams but no matches
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Public Registration Open</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {leagues.filter(l => l.is_public && l.registration_open).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Actively recruiting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Search leagues</Label>
            <Input
              id="search"
              placeholder="Search by league name, admin name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-end">
            <Button
              onClick={() => setBulkOperationsOpen(true)}
              disabled={selectedLeagues.length === 0}
              variant="outline"
            >
              Bulk Operations ({selectedLeagues.length})
            </Button>
          </div>
        </div>

        {/* Leagues Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Leagues ({filteredLeagues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedLeagues.length === filteredLeagues.length && filteredLeagues.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeagues(filteredLeagues.map(l => l.id));
                        } else {
                          setSelectedLeagues([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeagues.map((league) => (
                  <TableRow key={league.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedLeagues.includes(league.id)}
                        onChange={() => toggleLeagueSelection(league.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{league.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {league.description}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {league.is_public && (
                            <Badge variant="outline" className="text-xs">Public</Badge>
                          )}
                          {league.registration_open && (
                            <Badge variant="outline" className="text-xs">Open Registration</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{league.admin.name}</div>
                        <div className="text-sm text-gray-500">{league.admin.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(league.status)}>
                        {league.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{league.team_count} teams</div>
                        <div>{league.member_count} members</div>
                        <div>{league.match_count} matches</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Start: {new Date(league.start_date).toLocaleDateString()}</div>
                        <div>End: {new Date(league.end_date).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleLeagueStatus(league.id, league.status)}
                        >
                          {league.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteLeague(league)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete League</DialogTitle>
              <DialogDescription>
                This will permanently delete the league "{leagueToDelete?.name}" and all associated data including teams, matches, and scores.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmName">
                  Type the league name "{leagueToDelete?.name}" to confirm:
                </Label>
                <Input
                  id="confirmName"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder="League name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={confirmName !== leagueToDelete?.name}
              >
                Delete League
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Operations Dialog */}
        <Dialog open={bulkOperationsOpen} onOpenChange={setBulkOperationsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Operations</DialogTitle>
              <DialogDescription>
                Perform operations on {selectedLeagues.length} selected leagues.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulkOperation">Operation</Label>
                <Select value={bulkOperation} onValueChange={setBulkOperation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate Leagues</SelectItem>
                    <SelectItem value="deactivate">Deactivate Leagues</SelectItem>
                    <SelectItem value="setStatus">Set Custom Status</SelectItem>
                    <SelectItem value="makePublic">Make Public</SelectItem>
                    <SelectItem value="makePrivate">Make Private</SelectItem>
                    <SelectItem value="openRegistration">Open Registration</SelectItem>
                    <SelectItem value="closeRegistration">Close Registration</SelectItem>
                    <SelectItem value="delete">Delete Leagues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bulkOperation === 'setStatus' && (
                <div>
                  <Label htmlFor="bulkStatus">Status</Label>
                  <Select value={bulkStatusValue} onValueChange={setBulkStatusValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {bulkOperation === 'delete' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    ⚠️ Warning: This will permanently delete all selected leagues and their associated data.
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkOperationsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={executeBulkOperation}
                disabled={!bulkOperation || processing || (bulkOperation === 'setStatus' && !bulkStatusValue)}
                variant={bulkOperation === 'delete' ? 'destructive' : 'default'}
              >
                {processing ? 'Processing...' : 'Execute Operation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}