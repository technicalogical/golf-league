'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

export default function DestroyScheduleButton({ leagueId }: { leagueId: string }) {
  const router = useRouter();
  const [isDestroying, setIsDestroying] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDestroy() {
    setIsDestroying(true);

    try {
      const response = await fetch(`/api/leagues/${leagueId}/schedule`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to destroy schedule');
      }

      alert('Schedule destroyed successfully. You can now generate a new schedule.');
      router.refresh();
      setConfirmOpen(false);
      setOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDestroying(false);
    }
  }

  function handleFirstConfirm() {
    setOpen(false);
    setConfirmOpen(true);
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isDestroying}>
            {isDestroying ? 'Destroying...' : 'Destroy Schedule'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Destroy Schedule - Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              This will <strong>DELETE ALL MATCHES</strong> and schedules for this league. This action cannot be undone!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDestroying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleFirstConfirm();
              }}
              disabled={isDestroying}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Final Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              This is your <strong>final warning</strong>. All match data, scores, and schedules will be permanently deleted. Are you absolutely sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDestroying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDestroy();
              }}
              disabled={isDestroying}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDestroying ? 'Destroying...' : 'Yes, Destroy Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
