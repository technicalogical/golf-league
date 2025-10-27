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

export default function JoinOpenTeamButton({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleJoin() {
    setIsJoining(true);

    try {
      const response = await fetch(`/api/teams/${teamId}/join-open`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join team');
      }

      router.push(`/teams/${teamId}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setIsJoining(false);
      setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
          className="w-full"
          disabled={isJoining}
        >
          {isJoining ? 'Joining...' : 'Join Team'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Join {teamName}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to join this team? You can only be on one team at a time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isJoining}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleJoin();
            }}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Team'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
