'use client';

import PageHeader from '@/components/layout/Pageheader';
import { SOURCE_OPTIONS } from '@/components/leads/lead-form-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { createLeadSchema, type CreateLeadInput } from '@/schemas/lead/lead.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type LeadEditFormProps = {
  leadId: Id<'leads'>;
};

export function LeadEditForm({ leadId }: LeadEditFormProps) {
  const router = useRouter();
  const lead = useQuery(api.modules.lead.getLeadById, { leadId });
  const updateLead = useMutation(api.modules.lead.updateLead);

  const form = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      source: 'manual',
      name: '',
      mobile: '',
      email: '',
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
      discomName: '',
      discomConsumerNo: '',
    },
  });

  useEffect(() => {
    if (!lead) return;
    form.reset({
      source: lead.source,
      name: lead.name,
      mobile: lead.mobile,
      email: lead.email ?? '',
      addressLine1: lead.addressLine1,
      city: lead.city,
      state: lead.state,
      pincode: lead.pincode,
      electricityBillAmt: lead.electricityBillAmt,
      monthlyConsumptionKwh: lead.monthlyConsumptionKwh,
      rooftopType: lead.rooftopType,
      propertyType: lead.propertyType,
      discomName: lead.discomName ?? '',
      discomConsumerNo: lead.discomConsumerNo ?? '',
      expectedCapacityKw: lead.expectedCapacityKw,
    });
  }, [lead, form]);

  if (lead === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!lead) {
    return <p className="py-16 text-center text-muted-foreground">Lead not found</p>;
  }

  async function onSubmit(values: CreateLeadInput) {
    try {
      await updateLead({
        leadId,
        source: values.source,
        name: values.name,
        mobile: values.mobile,
        email: values.email || undefined,
        addressLine1: values.addressLine1,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        electricityBillAmt: values.electricityBillAmt,
        monthlyConsumptionKwh: values.monthlyConsumptionKwh,
        rooftopType: values.rooftopType,
        propertyType: values.propertyType,
        discomName: values.discomName || undefined,
        discomConsumerNo: values.discomConsumerNo || undefined,
        expectedCapacityKw: values.expectedCapacityKw,
      });
      toast.success('Lead updated');
      router.push(`/crm/leads/${leadId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={`Edit ${lead.leadNumber}`}
        description={lead.name}
        breadcrumbs={[
          { label: 'Leads', href: '/crm/leads' },
          { label: lead.leadNumber, href: `/crm/leads/${leadId}` },
          { label: 'Edit' },
        ]}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lead details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedCapacityKw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected kW</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discomName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DISCOM</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
