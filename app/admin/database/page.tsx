'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface HealthData {
  timestamp: string;
  health: {
    tableCounts: Record<string, number>;
    orphanedRecords: Record<string, number>;
    dataConsistency: Record<string, number>;
    storageStats: Record<string, number>;
  };
  summary: {
    totalTables: number;
    totalRecords: number;
    orphanedRecords: number;
    consistencyIssues: number;
  };
}

interface CleanupResult {
  operation: string;
  dryRun: boolean;
  timestamp: string;
  cleaned: Record<string, number | string>;
  errors: string[];
  summary: {
    totalCleaned: number;
    errorsCount: number;
    success: boolean;
  };
}

export default function AdminDatabasePage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState('');

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/database/health');
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
      } else {
        console.error('Failed to fetch health data');
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeCleanup = async () => {
    if (!selectedOperation) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/database/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: selectedOperation,
          dryRun: dryRun
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCleanupResult(result);

        // Refresh health data after cleanup
        if (!dryRun) {
          await fetchHealthData();
        }
      } else {
        console.error('Cleanup operation failed');
      }
    } catch (error) {
      console.error('Error executing cleanup:', error);
    } finally {
      setProcessing(false);
    }
  };

  const executeExport = async () => {
    if (!exportType) return;

    try {
      const response = await fetch('/api/admin/database/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exportType: exportType,
          tables: [] // Could be extended to allow custom table selection
        }),
      });

      if (response.ok) {
        // Trigger file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `golf-league-${exportType}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setExportDialogOpen(false);
        setExportType('');
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Error executing export:', error);
    }
  };

  const cleanupOperations = [
    {
      id: 'orphaned_hole_scores',
      name: 'Orphaned Hole Scores',
      description: 'Remove hole scores that reference deleted scorecards',
      severity: 'medium'
    },
    {
      id: 'orphaned_scorecards',
      name: 'Orphaned Scorecards',
      description: 'Remove scorecards that reference deleted matches',
      severity: 'medium'
    },
    {
      id: 'orphaned_players',
      name: 'Orphaned Players',
      description: 'Remove players who are not members of any team',
      severity: 'low'
    },
    {
      id: 'incomplete_profiles',
      name: 'Incomplete Profiles',
      description: 'Identify profiles missing name or email data',
      severity: 'low'
    },
    {
      id: 'old_announcements',
      name: 'Old Announcements',
      description: 'Remove announcements older than 6 months',
      severity: 'low'
    },
    {
      id: 'vacuum_analyze',
      name: 'Database Optimization',
      description: 'Optimize database performance (database-level operation)',
      severity: 'high'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading database health data...</div>
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
              Database Tools
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Database maintenance, health checks, and cleanup utilities
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setExportDialogOpen(true)} variant="outline">
              Export Data
            </Button>
            <Button onClick={fetchHealthData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Health Check'}
            </Button>
            <Link href="/admin">
              <Button variant="outline">← Back to Admin</Button>
            </Link>
          </div>
        </div>

        {healthData && (
          <>
            {/* Health Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{healthData.summary.totalTables}</div>
                  <p className="text-xs text-muted-foreground">Total Tables</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{healthData.summary.totalRecords.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">{healthData.summary.orphanedRecords}</div>
                  <p className="text-xs text-muted-foreground">Orphaned Records</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{healthData.summary.consistencyIssues}</div>
                  <p className="text-xs text-muted-foreground">Consistency Issues</p>
                </CardContent>
              </Card>
            </div>

            {/* Table Counts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Table Record Counts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead className="text-right">Records</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(healthData.health.tableCounts).map(([table, count]) => (
                        <TableRow key={table}>
                          <TableCell className="font-medium">{table}</TableCell>
                          <TableCell className="text-right">{count.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Issues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Orphaned Records</h4>
                    <div className="space-y-1">
                      {Object.entries(healthData.health.orphanedRecords).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={count > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Data Consistency</h4>
                    <div className="space-y-1">
                      {Object.entries(healthData.health.dataConsistency).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={count > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cleanup Operations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Cleanup Operations</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Run maintenance operations to clean up orphaned data and optimize performance
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cleanupOperations.map((operation) => (
                    <Card key={operation.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{operation.name}</h4>
                          <Badge className={getSeverityColor(operation.severity)}>
                            {operation.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {operation.description}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOperation(operation.id);
                            setCleanupDialogOpen(true);
                            setCleanupResult(null);
                          }}
                          className="w-full"
                        >
                          Run Cleanup
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Storage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(healthData.health.storageStats).map(([stat, value]) => (
                    <div key={stat} className="text-center">
                      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {stat.replace(/([A-Z])/g, ' $1')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Cleanup Dialog */}
        <Dialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Database Cleanup Operation</DialogTitle>
              <DialogDescription>
                {selectedOperation && cleanupOperations.find(op => op.id === selectedOperation)?.description}
              </DialogDescription>
            </DialogHeader>

            {cleanupResult ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>
                    {cleanupResult.summary.success ? 'Operation Completed' : 'Operation Failed'}
                  </AlertTitle>
                  <AlertDescription>
                    {cleanupResult.dryRun ? 'Dry run completed - no data was modified' : 'Live operation completed'}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">Results:</h4>
                  {Object.entries(cleanupResult.cleaned).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                {cleanupResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Errors:</h4>
                    {cleanupResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="dryRun"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                  />
                  <Label htmlFor="dryRun">
                    Dry run (preview changes without executing)
                  </Label>
                </div>

                {!dryRun && (
                  <Alert>
                    <AlertTitle>⚠️ Warning</AlertTitle>
                    <AlertDescription>
                      This will permanently modify your database. Make sure you have a backup.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setCleanupDialogOpen(false)}>
                Close
              </Button>
              {!cleanupResult && (
                <Button
                  onClick={executeCleanup}
                  disabled={processing}
                  variant={!dryRun ? 'destructive' : 'default'}
                >
                  {processing ? 'Processing...' : dryRun ? 'Preview Changes' : 'Execute Cleanup'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Database Data</DialogTitle>
              <DialogDescription>
                Export data for backup, analysis, or migration purposes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="exportType">Export Type</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select export type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leagues_summary">
                      Leagues Summary - Basic league info with team counts
                    </SelectItem>
                    <SelectItem value="users_summary">
                      Users Summary - User profiles and activity data
                    </SelectItem>
                    <SelectItem value="system_stats">
                      System Statistics - Database stats and activity metrics
                    </SelectItem>
                    <SelectItem value="custom_tables">
                      Custom Tables - Specific table data (limited)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertTitle>Export Information</AlertTitle>
                <AlertDescription>
                  Exports are generated in JSON format and exclude sensitive data like passwords.
                  Large datasets may be limited to prevent excessive file sizes.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={executeExport}
                disabled={!exportType}
              >
                Download Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}