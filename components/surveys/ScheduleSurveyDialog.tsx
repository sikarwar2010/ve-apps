'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ScheduleSurveyDialog() {
  const [open, setOpen] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [engineerId, setEngineerId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const leads = useQuery(api.modules.lead.listLeads, { limit: 100 });
  const users = useQuery(api.modules.settings.listUsers, {});
  const schedule = useMutation(api.modules.surveys.scheduleSurvey);

  const engineers = users?.filter((u) => ['survey_engineer', 'sales_manager', 'admin', 'super_admin'].includes(u.role));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId || !engineerId || !scheduledAt) return;
    setSubmitting(true);
    try {
      await schedule({
        leadId: leadId as Id<'leads'>,
        assignedEngineerId: engineerId as Id<'users'>,
        scheduledAt: new Date(scheduledAt).getTime(),
      });
      toast.success('Survey scheduled');
      setOpen(false);
      setLeadId('');
      setEngineerId('');
      setScheduledAt('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarPlus className="mr-2 size-4" />
          Schedule survey
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule site survey</DialogTitle>
        </DialogHeader>
        {!leads || !users ? (
          <Spinner className="mx-auto size-6" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Lead</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name} ({l.leadNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Engineer</Label>
              <Select value={engineerId} onValueChange={setEngineerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineers?.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scheduledAt">Date & time</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Scheduling…' : 'Schedule'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
