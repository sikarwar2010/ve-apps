'use client';

import PageHeader from '@/components/layout/Pageheader';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { SURVEY_STATUS } from '@/utils/constants';
import { formatCapacity, formatDateTime } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import { Ban, CalendarClock, CheckCircle2, FileText, MapPin, Ruler, Sun, Trash2, User, Zap } from 'lucide-react';
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
          <div className="flex items-center gap-2">
            <StatusBadge status={survey.status} config={SURVEY_STATUS} />
            {isComplete && survey.leadId && (
              <Button asChild size="sm">
                <Link href={`/quotations/new?leadId=${survey.leadId}&surveyId=${surveyId}`}>
                  <FileText className="mr-1.5 size-4" />
                  Create Quotation
                </Link>
              </Button>
            )}
            {canModify && (
              <>
                <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
                  <Ban className="mr-1.5 size-4" />
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Schedule info */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="size-4 text-muted-foreground" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Scheduled At</p>
                <p className="mt-0.5 font-semibold">{formatDateTime(survey.scheduledAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned Engineer</p>
                <p className={`mt-0.5 font-semibold flex items-center gap-1.5 ${survey.engineer ? '' : 'text-muted-foreground'}`}>
                  <User className="size-3.5" />
                  {survey.engineer?.name ?? 'Unassigned'}
                </p>
              </div>
              {survey.lead && (
                <div>
                  <p className="text-xs text-muted-foreground">Site Location</p>
                  <p className="mt-0.5 font-medium flex items-start gap-1.5">
                    <MapPin className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                    <span>{survey.lead.addressLine1}, {(survey.lead as { city?: string }).city}</span>
                  </p>
                </div>
              )}
            </div>
            {survey.leadId && (
              <>
                <Separator />
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/crm/leads/${survey.leadId}`}>View Lead</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Results or completion form */}
        <div className="lg:col-span-2">
          {isComplete ? (
            <Card className="border-emerald-200 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Survey Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="size-3 text-amber-500" /> Recommended
                    </p>
                    <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCapacity(survey.recommendedCapacityKw ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-white px-4 py-3 dark:bg-card">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sun className="size-3 text-amber-500" /> Panels
                    </p>
                    <p className="mt-1 text-xl font-bold">{survey.panelCount} <span className="text-sm font-normal text-muted-foreground">nos</span></p>
                  </div>
                  {survey.rooftopAreaSqFt && (
                    <div className="rounded-xl border border-border/60 bg-white px-4 py-3 dark:bg-card">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Ruler className="size-3" /> Rooftop
                      </p>
                      <p className="mt-1 text-xl font-bold">{survey.rooftopAreaSqFt} <span className="text-sm font-normal text-muted-foreground">sq ft</span></p>
                    </div>
                  )}
                </div>
                {survey.shadowAnalysis && (
                  <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                    <p className="mb-1 text-xs font-medium text-foreground">Shadow Analysis</p>
                    {survey.shadowAnalysis}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Complete Survey</CardTitle>
                <p className="text-xs text-muted-foreground">Record rooftop assessment and system sizing findings</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleComplete} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>Recommended kW <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="100"
                        value={capacityKw}
                        onChange={(e) => setCapacityKw(e.target.value)}
                        placeholder={String(survey.lead?.expectedCapacityKw ?? '5.0')}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Panel Count <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        min="1"
                        value={panelCount}
                        onChange={(e) => setPanelCount(e.target.value)}
                        placeholder="10"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Rooftop Area (sq ft)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={rooftopArea}
                        onChange={(e) => setRooftopArea(e.target.value)}
                        placeholder="600"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Shadow Analysis</Label>
                    <Textarea
                      value={shadowAnalysis}
                      onChange={(e) => setShadowAnalysis(e.target.value)}
                      placeholder="Describe shading sources, obstructions, or clear notes…"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Additional Remarks</Label>
                    <Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Structural notes, recommendations, next steps…"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="mr-2 size-4" />
                    {submitting ? 'Saving…' : 'Mark Survey Complete'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
