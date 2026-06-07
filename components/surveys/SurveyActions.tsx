'use client';

import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { Ban, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type SurveyRow = {
  _id: Id<'surveys'>;
  surveyNumber: string;
  status: string;
};

export function SurveyActions({ survey }: { survey: SurveyRow }) {
  const router = useRouter();
  const cancelSurvey = useMutation(api.modules.surveys.cancelSurvey);
  const deleteSurvey = useMutation(api.modules.surveys.deleteSurvey);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const canModify = survey.status !== 'completed' && survey.status !== 'cancelled';

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelSurvey({ surveyId: survey._id });
      toast.success('Survey cancelled');
      setCancelOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteSurvey({ surveyId: survey._id });
      toast.success('Survey deleted');
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0" onClick={(e) => e.stopPropagation()}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/survey/${survey._id}`}>
              <Eye />
              View details
            </Link>
          </DropdownMenuItem>
          {canModify ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCancelOpen(true)}>
                <Ban />
                Cancel survey
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel survey?"
        description={`${survey.surveyNumber} will be marked cancelled.`}
        confirmLabel="Cancel survey"
        loading={loading}
        onConfirm={handleCancel}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete survey?"
        description={`${survey.surveyNumber} will be permanently removed.`}
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
