'use client';

import PageHeader from '@/components/layout/Pageheader';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { SURVEY_STATUS } from '@/utils/constants';
import { formatCapacity, formatDateTime } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import { Ban, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function SurveyDetailView({ surveyId }: { surveyId: Id<'surveys'> }) {
  const router = useRouter();
  const survey = useQuery(api.modules.surveys.getSurveyById, { surveyId });
  const completeSurvey = useMutation(api.modules.surveys.completeSurvey);
  const cancelSurvey = useMutation(api.modules.surveys.cancelSurvey);
  const deleteSurvey = useMutation(api.modules.surveys.deleteSurvey);

  const [capacityKw, setCapacityKw] = useState('');
  const [panelCount, setPanelCount] = useState('');
  const [rooftopArea, setRooftopArea] = useState('');
  const [shadowAnalysis, setShadowAnalysis] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (survey === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!survey) return <p className="py-16 text-center text-muted-foreground">Survey not found</p>;

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    const kw = parseFloat(capacityKw);
    const panels = parseInt(panelCount, 10);
    if (!kw || !panels) {
      toast.error('Enter recommended capacity and panel count');
      return;
    }
    setSubmitting(true);
    try {
      await completeSurvey({
        surveyId,
        recommendedCapacityKw: kw,
        panelCount: panels,
        rooftopAreaSqFt: rooftopArea ? parseFloat(rooftopArea) : undefined,
        shadowAnalysis: shadowAnalysis || undefined,
        remarks: remarks || undefined,
        structuralStrength: 'good',
      });
      toast.success('Survey completed — you can now create a quotation');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete survey');
    } finally {
      setSubmitting(false);
    }
  }

  const isComplete = survey.status === 'completed';
  const canModify = survey.status !== 'completed' && survey.status !== 'cancelled';

  async function handleCancel() {
    setActionLoading(true);
    try {
      await cancelSurvey({ surveyId });
      toast.success('Survey cancelled');
      setCancelOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      await deleteSurvey({ surveyId });
      toast.success('Survey deleted');
      router.push('/survey');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={survey.surveyNumber}
        description={survey.lead?.name ?? 'Site survey'}
        breadcrumbs={[{ label: 'Site Survey', href: '/survey' }, { label: survey.surveyNumber }]}
        actions={
          <div className="flex gap-2">
            <StatusBadge status={survey.status} config={SURVEY_STATUS} />
            {isComplete && survey.leadId ? (
              <Button asChild size="sm">
                <Link href={`/quotations/new?leadId=${survey.leadId}&surveyId=${surveyId}`}>
                  <FileText className="mr-1.5 size-4" />
                  Create quotation
                </Link>
              </Button>
            ) : null}
            {canModify ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
                  <Ban className="mr-1.5 size-4" />
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="mr-1.5 size-4" />
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      <ConfirmDeleteDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel survey?"
        description="Survey will be marked cancelled."
        confirmLabel="Cancel survey"
        loading={actionLoading}
        onConfirm={handleCancel}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete survey?"
        description="Survey will be permanently removed."
        loading={actionLoading}
        onConfirm={handleDelete}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Scheduled: {formatDateTime(survey.scheduledAt)}</p>
            <p>Engineer: {survey.engineer?.name ?? '—'}</p>
            {survey.lead ? (
              <p>
                Site: {survey.lead.addressLine1}, {survey.lead.city}
              </p>
            ) : null}
            {survey.leadId ? (
              <Button asChild variant="link" className="h-auto p-0">
                <Link href={`/crm/leads/${survey.leadId}`}>View lead</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        {isComplete ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Capacity: {formatCapacity(survey.recommendedCapacityKw ?? 0)}</p>
              <p>Panels: {survey.panelCount} Nos</p>
              {survey.shadowAnalysis ? <p className="text-muted-foreground">{survey.shadowAnalysis}</p> : null}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Complete survey</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleComplete} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Recommended kW</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={capacityKw}
                      onChange={(e) => setCapacityKw(e.target.value)}
                      placeholder={String(survey.lead?.expectedCapacityKw ?? '5')}
                      required
                    />
                  </div>
                  <div>
                    <Label>Panel count</Label>
                    <Input type="number" value={panelCount} onChange={(e) => setPanelCount(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <Label>Rooftop area (sq ft)</Label>
                  <Input type="number" value={rooftopArea} onChange={(e) => setRooftopArea(e.target.value)} />
                </div>
                <div>
                  <Label>Shadow analysis</Label>
                  <Textarea value={shadowAnalysis} onChange={(e) => setShadowAnalysis(e.target.value)} rows={2} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Saving…' : 'Mark survey complete'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
