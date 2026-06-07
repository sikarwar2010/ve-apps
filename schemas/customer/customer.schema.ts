import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile'),
  email: z.string().email().optional().or(z.literal('')),
  addressLine1: z.string().min(5, 'Address required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  propertyType: z.enum(['residential', 'commercial', 'industrial']),
  discomName: z.string().min(2, 'DISCOM required'),
  discomConsumerNo: z.string().min(1, 'Consumer number required'),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  gstin: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankName: z.string().optional(),
});

export type CustomerFormInput = z.infer<typeof customerSchema>;
