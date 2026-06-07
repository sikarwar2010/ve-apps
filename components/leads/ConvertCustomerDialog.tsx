'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function ConvertCustomerDialog({ leadId, defaultDiscom }: { leadId: Id<'leads'>; defaultDiscom?: string }) {
  const [open, setOpen] = useState(false);
  const [discomName, setDiscomName] = useState(defaultDiscom ?? '');
  const [consumerNo, setConsumerNo] = useState('');
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial' | 'industrial'>('residential');
  const [submitting, setSubmitting] = useState(false);
  const convert = useMutation(api.modules.customers.convertLeadToCustomer);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const customerId = await convert({
        leadId,
        discomName,
        discomConsumerNo: consumerNo,
        propertyType,
      });
      toast.success('Lead converted to customer');
      setOpen(false);
      router.push(`/crm/customers/${customerId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <UserPlus className="mr-2 size-4" />
          Convert to customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert lead to customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>DISCOM name</Label>
            <Input value={discomName} onChange={(e) => setDiscomName(e.target.value)} required />
          </div>
          <div>
            <Label>Consumer number</Label>
            <Input value={consumerNo} onChange={(e) => setConsumerNo(e.target.value)} required />
          </div>
          <div>
            <Label>Property type</Label>
            <Select value={propertyType} onValueChange={(v) => setPropertyType(v as typeof propertyType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Converting…' : 'Create customer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
