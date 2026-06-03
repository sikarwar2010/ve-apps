import { z } from 'zod';

export const quotationLineItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0.01),
  unitPrice: z.number().min(0),
  discountPct: z.number().min(0).max(100).optional(),
});

export const createQuotationSchema = z.object({
  leadId: z.string(),
  surveyId: z.string().optional(),
  systemCapacityKw: z.number().min(1).max(500),
  panelCount: z.number().min(1),
  validTill: z.date(),
  lineItems: z.array(quotationLineItemSchema).min(1, 'Add at least one item'),
  tokenAmountPct: z.number().min(0).max(100).optional(),
  onDeliveryPct: z.number().min(0).max(100).optional(),
  onInstallationPct: z.number().min(0).max(100).optional(),
  onSubsidyPct: z.number().min(0).max(100).optional(),
  isFinanced: z.boolean().default(false),
  termsAndConditions: z.string().optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

// Subsidy calculator
export const subsidyCategorySchema = z.enum(['upto_2kw', '2_3kw', 'above_3kw']);

export function getSubsidyAmount(capacityKw: number): number {
  // PM Surya Ghar Yojana rates (as per scheme)
  if (capacityKw <= 2) {
    return Math.round(capacityKw * 30000); // ₹30,000/kW upto 2kW
  } else if (capacityKw <= 3) {
    const base = 2 * 30000;
    const extra = (capacityKw - 2) * 18000; // ₹18,000/kW for 2-3kW
    return Math.round(base + extra);
  } else {
    return 78000; // Maximum ₹78,000 above 3kW
  }
}
