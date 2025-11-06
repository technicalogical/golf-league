'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { ScoringRule, getScoringRuleDescription } from '@/lib/types/scoring';

export default function AdminScoringRulesPage() {
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<ScoringRule | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadScoringRules();
  }, []);

  useEffect(() => {
    const filtered = scoringRules.filter(
      (rule) =>
        rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRules(filtered);
  }, [searchTerm, scoringRules]);

  async function loadScoringRules() {
    try {
      const response = await fetch('/api/scoring-rules');
      if (response.ok) {
        const data = await response.json();
        setScoringRules(data);
        setFilteredRules(data);
      } else {
        alert('Failed to load scoring rules');
      }
    } catch (error) {
      console.error('Error loading scoring rules:', error);
      alert('Error loading scoring rules');
    } finally {
      setLoading(false);
    }
  }

  function openDeleteDialog(rule: ScoringRule) {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteRule() {
    if (!ruleToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/scoring-rules/${ruleToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setScoringRules(scoringRules.filter(rule => rule.id !== ruleToDelete.id));
        setDeleteDialogOpen(false);
        setRuleToDelete(null);
      } else {
        const error = await response.json();
        alert(`Failed to delete scoring rule: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting scoring rule:', error);
      alert('Error deleting scoring rule');
    } finally {
      setDeleting(false);
    }
  }

  const getHandicapMethodDisplay = (rule: ScoringRule) => {
    switch (rule.handicap_method) {
      case 'none':
        return 'No Handicap';
      case 'full':
        return 'Full Handicap';
      case 'percentage':
        return `${rule.handicap_percentage}% Handicap`;
      case 'cap_difference':
        return `Max ${rule.max_handicap_difference} Strokes`;
      default:
        return rule.handicap_method;
    }
  };

  const getStrokeHolesDisplay = (rule: ScoringRule) => {
    switch (rule.stroke_holes) {
      case 'all':
        return 'All Holes';
      case 'par_4_5_only':
        return 'Par 4s & 5s Only';
      case 'handicap_order':
        return 'Handicap Order';
      case 'custom':
        return `Custom (${rule.custom_stroke_holes?.length || 0} holes)`;
      default:
        return rule.stroke_holes;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading scoring rules...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Scoring Rules Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure how matches are scored and points are awarded
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/scoring-rules/new">
              <Button>Create New Rule</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">← Back to Admin</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Scoring Rules ({filteredRules.length})</CardTitle>
            <div className="mt-4">
              <Input
                placeholder="Search by name or description..."
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
                  <TableHead>Description</TableHead>
                  <TableHead>Handicap Method</TableHead>
                  <TableHead>Stroke Holes</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {rule.name}
                      {rule.is_system_default && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Default
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={rule.description}>
                        {rule.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>{getHandicapMethodDisplay(rule)}</TableCell>
                    <TableCell>{getStrokeHolesDisplay(rule)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{rule.hole_points} pts/hole</div>
                        {rule.match_bonus_points > 0 && (
                          <div className="text-green-600">+{rule.match_bonus_points} bonus</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/scoring-rules/${rule.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/admin/scoring-rules/${rule.id}/preview`}>
                          <Button variant="outline" size="sm">
                            Preview
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(rule)}
                          disabled={rule.is_system_default}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredRules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No scoring rules found matching your search.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Scoring Rule</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the scoring rule
                and it will no longer be available for new leagues or matches.
              </DialogDescription>
            </DialogHeader>

            {ruleToDelete && (
              <div className="py-4">
                <p className="mb-4">
                  You are about to delete: <strong>{ruleToDelete.name}</strong>
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                  <div><strong>Handicap:</strong> {getHandicapMethodDisplay(ruleToDelete)}</div>
                  <div><strong>Stroke Holes:</strong> {getStrokeHolesDisplay(ruleToDelete)}</div>
                  <div><strong>Points:</strong> {ruleToDelete.hole_points} per hole, +{ruleToDelete.match_bonus_points} bonus</div>
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
                onClick={handleDeleteRule}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}