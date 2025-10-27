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

export default function LeaveTeamButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleLeave() {
    setIsLeaving(true);

    try {
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to leave team');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsLeaving(false);
      setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full"
          disabled={isLeaving}
        >
          {isLeaving ? 'Leaving...' : 'Leave Team'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Team</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave this team? You will need a new invite code to rejoin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleLeave();
            }}
            disabled={isLeaving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLeaving ? 'Leaving...' : 'Leave Team'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
