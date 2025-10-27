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

export default function RemoveTeamButton({
  leagueId,
  teamId,
  teamName,
}: {
  leagueId: string;
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleRemove() {
    setIsRemoving(true);

    try {
      const response = await fetch(`/api/leagues/${leagueId}/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove team');
      }

      router.refresh();
      setOpen(false);
    } catch (err: any) {
      alert(err.message);
      setIsRemoving(false);
      setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isRemoving}
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team from League</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{teamName}</strong> from this league? This will delete all their matches and scores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRemove();
            }}
            disabled={isRemoving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRemoving ? 'Removing...' : 'Remove Team'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
