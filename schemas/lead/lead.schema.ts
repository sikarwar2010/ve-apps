import { z } from 'zod';

export const leadSourceSchema = z.enum([
  'website',
  'meta_ads',
  'google_ads',
  'walk_in',
  'referral',
  'electrician_partner',
  'builder_channel',
  'manual',
]);

export const leadStatusSchema = z.enum([
  'new',
  'contacted',
  'interested',
  'survey_scheduled',
  'survey_completed',
  'quotation_sent',
  'negotiation',
  'won',
  'lost',
]);

export const createLeadSchema = z.object({
  source: leadSourceSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  addressLine1: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  electricityBillAmt: z.number().min(0).optional(),
  monthlyConsumptionKwh: z.number().min(0).optional(),
  rooftopType: z.enum(['rcc', 'tin', 'asbestos', 'other']).optional(),
  propertyType: z.enum(['residential', 'commercial', 'industrial']).optional(),
  discomName: z.string().optional(),
  discomConsumerNo: z.string().optional(),
  expectedCapacityKw: z.number().min(1).max(10).optional(),
  assignedToUserId: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
