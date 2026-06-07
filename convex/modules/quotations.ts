import { v } from 'convex/values';

import { generateDocumentNumber } from '@/lib/numbering';
import { mutation } from '../_generated/server';
import { getOrCreateUser } from '../lib/auth';

export const createQuotation = mutation({
  args: {
    leadId: v.id('leads'),
    surveyId: v.optional(v.id('surveys')),
    systemCapacityKw: v.number(),
    panelCount: v.number(),
    validTill: v.number(),
    lineItems: v.array(v.any()),
    tokenAmountPct: v.optional(v.number()),
    onDeliveryPct: v.optional(v.number()),
    onInstallationPct: v.optional(v.number()),
    onSubsidyPct: v.optional(v.number()),
    termsAndConditions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const user = await getOrCreateUser(ctx);

    // Calculate financials
    let subtotal = 0,
      totalTax = 0;
    const computedItems = args.lineItems.map((item: any) => {
      const product = { taxRate: item.taxRate, hsnCode: item.hsnCode }; // fetch from product
      const discountedPrice = item.unitPrice * (1 - (item.discountPct ?? 0) / 100);
      const taxableAmount = discountedPrice * item.quantity;
      const taxAmount = taxableAmount * (item.taxRate / 100);
      const lineTotal = taxableAmount + taxAmount;
      subtotal += taxableAmount;
      totalTax += taxAmount;
      return { ...item, taxableAmount, taxAmount, lineTotal };
    });

    // Subsidy calculation (PM Surya Ghar)
    const capacityKw = args.systemCapacityKw;
    let subsidyAmount = 0;
    let subsidyCategory: 'upto_2kw' | '2_3kw' | 'above_3kw' = 'upto_2kw';
    if (capacityKw <= 2) {
      subsidyAmount = capacityKw * 30000;
      subsidyCategory = 'upto_2kw';
    } else if (capacityKw <= 3) {
      subsidyAmount = 2 * 30000 + (capacityKw - 2) * 18000;
      subsidyCategory = '2_3kw';
    } else {
      subsidyAmount = 78000;
      subsidyCategory = 'above_3kw';
    }

    const totalAmount = subtotal + totalTax;
    const quotationNumber = await generateDocumentNumber(ctx, 'QT');
    const now = Date.now();

    const quotationId = await ctx.db.insert('quotations', {
      quotationNumber,
      version: 1,
      leadId: args.leadId,
      surveyId: args.surveyId,
      status: 'draft',
      validTill: args.validTill,
      systemCapacityKw: args.systemCapacityKw,
      panelCount: args.panelCount,
      lineItems: computedItems,
      subtotal,
      discountAmount: 0,
      taxableValue: subtotal,
      cgstAmount: totalTax / 2,
      sgstAmount: totalTax / 2,
      igstAmount: 0,
      totalAmount,
      subsidyEligibleCapacityKw: Math.min(capacityKw, 3),
      subsidyCategory,
      subsidyAmountEstimated: subsidyAmount,
      netAmountAfterSubsidy: totalAmount - subsidyAmount,
      tokenAmountPct: args.tokenAmountPct,
      onDeliveryPct: args.onDeliveryPct,
      onInstallationPct: args.onInstallationPct,
      onSubsidyPct: args.onSubsidyPct,
      termsAndConditions: args.termsAndConditions,
      createdByUserId: user!._id,
      createdAt: now,
      updatedAt: now,
    });

    return quotationId;
  },
});
