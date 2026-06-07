import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { logAudit } from '../lib/audit';
import { getOrCreateUser } from '../lib/auth';
import { generateDocumentNumber } from '../lib/numbering';

export const listQuotations = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const quotations = await ctx.db.query('quotations').order('desc').take(limit);

    return Promise.all(
      quotations.map(async (q) => {
        const lead = await ctx.db.get(q.leadId);
        return { ...q, lead };
      }),
    );
  },
});

export const getQuotationById = query({
  args: { quotationId: v.id('quotations') },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;
    const lead = await ctx.db.get(quotation.leadId);
    const survey = quotation.surveyId ? await ctx.db.get(quotation.surveyId) : null;
    return { ...quotation, lead, survey };
  },
});

export const updateQuotationStatus = mutation({
  args: {
    quotationId: v.id('quotations'),
    status: v.union(
      v.literal('draft'),
      v.literal('sent'),
      v.literal('under_negotiation'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('expired'),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error('Quotation not found');

    await ctx.db.patch(args.quotationId, {
      status: args.status,
      updatedAt: Date.now(),
      ...(args.status === 'approved' ? { approvedByUserId: user._id, approvedAt: Date.now() } : {}),
    });

    if (args.status === 'sent') {
      await ctx.db.patch(quotation.leadId, { status: 'quotation_sent', updatedAt: Date.now() });
    }

    await logAudit(ctx, {
      userId: user._id,
      action: 'status_change',
      entityType: 'quotations',
      entityId: args.quotationId as string,
      newValues: { status: args.status },
    });
  },
});

export const convertToOrder = mutation({
  args: { quotationId: v.id('quotations'), customerId: v.id('customers') },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status !== 'approved') throw new Error('Quotation must be approved first');

    const now = Date.now();
    const orderNumber = await generateDocumentNumber(ctx, 'SO');
    const netAmount = quotation.netAmountAfterSubsidy ?? quotation.totalAmount;

    const orderId = await ctx.db.insert('salesOrders', {
      orderNumber,
      quotationId: args.quotationId,
      customerId: args.customerId,
      leadId: quotation.leadId,
      status: 'confirmed',
      orderDate: now,
      totalAmount: quotation.totalAmount,
      subsidyAmountEstimated: quotation.subsidyAmountEstimated ?? 0,
      netAmount,
      paymentSchedule: [
        {
          milestone: 'Token',
          duePct: quotation.tokenAmountPct ?? 10,
          dueAmount: (netAmount * (quotation.tokenAmountPct ?? 10)) / 100,
          status: 'pending' as const,
        },
        {
          milestone: 'On Delivery',
          duePct: quotation.onDeliveryPct ?? 40,
          dueAmount: (netAmount * (quotation.onDeliveryPct ?? 40)) / 100,
          status: 'pending' as const,
        },
        {
          milestone: 'On Installation',
          duePct: quotation.onInstallationPct ?? 40,
          dueAmount: (netAmount * (quotation.onInstallationPct ?? 40)) / 100,
          status: 'pending' as const,
        },
        {
          milestone: 'On Subsidy',
          duePct: quotation.onSubsidyPct ?? 10,
          dueAmount: (netAmount * (quotation.onSubsidyPct ?? 10)) / 100,
          status: 'pending' as const,
        },
      ],
      isFinanced: false,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.quotationId, { status: 'converted_to_order', updatedAt: now });

    await logAudit(ctx, {
      userId: user._id,
      action: 'convert',
      entityType: 'salesOrders',
      entityId: orderId as string,
      newValues: { quotationId: args.quotationId },
    });

    return orderId;
  },
});

export const createQuotation = mutation({
  args: {
    leadId: v.id('leads'),
    surveyId: v.optional(v.id('surveys')),
    systemCapacityKw: v.number(),
    panelCount: v.number(),
    validTill: v.number(),
    lineItems: v.array(
      v.object({
        productId: v.id('products'),
        productName: v.string(),
        sku: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        discountPct: v.optional(v.number()),
        taxRate: v.number(),
        hsnCode: v.string(),
      }),
    ),
    tokenAmountPct: v.optional(v.number()),
    onDeliveryPct: v.optional(v.number()),
    onInstallationPct: v.optional(v.number()),
    onSubsidyPct: v.optional(v.number()),
    termsAndConditions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);

    let subtotal = 0;
    let totalTax = 0;
    const computedItems = args.lineItems.map((item) => {
      const discountedPrice = item.unitPrice * (1 - (item.discountPct ?? 0) / 100);
      const taxableAmount = discountedPrice * item.quantity;
      const taxAmount = taxableAmount * (item.taxRate / 100);
      const lineTotal = taxableAmount + taxAmount;
      subtotal += taxableAmount;
      totalTax += taxAmount;
      return { ...item, taxableAmount, taxAmount, lineTotal };
    });

    const capacityKw = args.systemCapacityKw;
    let subsidyAmount = 0;
    let subsidyCategory: 'upto_2kw' | '2_3kw' | 'above_3kw' = 'upto_2kw';
    if (capacityKw <= 2) {
      subsidyAmount = capacityKw * 30000;
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
      tokenAmountPct: args.tokenAmountPct ?? 10,
      onDeliveryPct: args.onDeliveryPct ?? 40,
      onInstallationPct: args.onInstallationPct ?? 40,
      onSubsidyPct: args.onSubsidyPct ?? 10,
      termsAndConditions: args.termsAndConditions,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'create',
      entityType: 'quotations',
      entityId: quotationId as string,
    });

    return quotationId;
  },
});
