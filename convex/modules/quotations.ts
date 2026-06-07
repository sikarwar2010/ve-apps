import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { logAudit } from '../lib/audit';
import { getOrCreateUser } from '../lib/auth';
import { generateDocumentNumber } from '../lib/numbering';
import { assertLeadForQuotation, getCompletedSurveyForLead, getOrCreateCustomerFromLead } from '../lib/presales';

const DEFAULT_TERMS = `1. Quotation valid 30 days from issue date.
2. GST as per line-item HSN rates. PM Surya subsidy per current MNRE norms — government disbursement to customer bank account.
3. Payment per milestone schedule; token non-refundable after PO confirmation.
4. Installation 15–21 working days from dispatch, subject to DISCOM approvals.
5. OEM warranties apply; workmanship 1 year from commissioning.`;

export const listQuotations = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    let quotations = await ctx.db.query('quotations').order('desc').take(limit);
    if (args.status) quotations = quotations.filter((q) => q.status === args.status);

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
    const customer = quotation.customerId ? await ctx.db.get(quotation.customerId) : null;
    const createdBy = await ctx.db.get(quotation.createdByUserId);
    return { ...quotation, lead, survey, customer, createdBy };
  },
});

/** Full document payload for customer-facing quotation PDF/print */
export const getQuotationDocument = query({
  args: { quotationId: v.id('quotations') },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) return null;

    const [company, lead, survey, createdBy] = await Promise.all([
      ctx.db.query('company').first(),
      ctx.db.get(quotation.leadId),
      quotation.surveyId ? ctx.db.get(quotation.surveyId) : null,
      ctx.db.get(quotation.createdByUserId),
    ]);

    const customer = quotation.customerId ? await ctx.db.get(quotation.customerId) : null;
    const primaryBank = company?.bankAccounts?.find((b) => b.isPrimary) ?? company?.bankAccounts?.[0];

    return {
      quotation,
      company,
      lead,
      survey,
      customer,
      createdBy,
      primaryBank,
      billTo: customer ?? lead,
    };
  },
});

export const listQuotationsByLead = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const all = await ctx.db
      .query('quotations')
      .withIndex('by_lead', (q) => q.eq('leadId', args.leadId))
      .collect();
    return all.sort((a, b) => b.createdAt - a.createdAt);
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

    const now = Date.now();
    if (args.status === 'sent' && quotation.validTill < now) {
      throw new Error('Quotation has expired. Create a revised quote.');
    }

    await ctx.db.patch(args.quotationId, {
      status: args.status,
      updatedAt: now,
      ...(args.status === 'approved' ? { approvedByUserId: user._id, approvedAt: now } : {}),
    });

    const lead = await ctx.db.get(quotation.leadId);
    if (lead) {
      if (args.status === 'sent') {
        await ctx.db.patch(quotation.leadId, { status: 'quotation_sent', updatedAt: now });
        await ctx.db.insert('leadActivities', {
          leadId: quotation.leadId,
          type: 'email',
          content: `Quotation ${quotation.quotationNumber} sent to customer`,
          doneByUserId: user._id,
          createdAt: now,
        });
      }
      if (args.status === 'approved') {
        await ctx.db.patch(quotation.leadId, { status: 'negotiation', updatedAt: now });
      }
      if (args.status === 'rejected') {
        await ctx.db.insert('leadActivities', {
          leadId: quotation.leadId,
          type: 'note',
          content: `Quotation ${quotation.quotationNumber} rejected by customer`,
          doneByUserId: user._id,
          createdAt: now,
        });
      }
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

export const sendQuotation = mutation({
  args: { quotationId: v.id('quotations') },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status !== 'draft' && quotation.status !== 'under_negotiation') {
      throw new Error('Only draft quotations can be sent');
    }

    const now = Date.now();
    await ctx.db.patch(args.quotationId, { status: 'sent', updatedAt: now });
    await ctx.db.patch(quotation.leadId, { status: 'quotation_sent', updatedAt: now });
    await ctx.db.insert('leadActivities', {
      leadId: quotation.leadId,
      type: 'email',
      content: `Quotation ${quotation.quotationNumber} sent to customer for review`,
      doneByUserId: user._id,
      createdAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'send',
      entityType: 'quotations',
      entityId: args.quotationId as string,
    });

    return { success: true };
  },
});

export const convertToOrder = mutation({
  args: {
    quotationId: v.id('quotations'),
    customerId: v.optional(v.id('customers')),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status === 'converted_to_order') {
      throw new Error('Quotation already converted to order');
    }
    if (quotation.status !== 'approved') {
      throw new Error('Quotation must be approved by customer before creating sales order');
    }

    const lead = await ctx.db.get(quotation.leadId);
    if (!lead) throw new Error('Lead not found');

    let customerId = args.customerId;
    if (!customerId) {
      customerId = await getOrCreateCustomerFromLead(ctx, lead, user._id, (p) => generateDocumentNumber(ctx, p));
    }

    const now = Date.now();
    const orderNumber = await generateDocumentNumber(ctx, 'SO');
    const netAmount = quotation.netAmountAfterSubsidy ?? quotation.totalAmount;

    const tokenPct = quotation.tokenAmountPct ?? 10;
    const deliveryPct = quotation.onDeliveryPct ?? 40;
    const installPct = quotation.onInstallationPct ?? 40;
    const subsidyPct = quotation.onSubsidyPct ?? 10;

    const orderId = await ctx.db.insert('salesOrders', {
      orderNumber,
      quotationId: args.quotationId,
      customerId,
      leadId: quotation.leadId,
      status: 'confirmed',
      orderDate: now,
      totalAmount: quotation.totalAmount,
      subsidyAmountEstimated: quotation.subsidyAmountEstimated ?? 0,
      netAmount,
      paymentSchedule: [
        { milestone: 'Token / Advance', duePct: tokenPct, dueAmount: (netAmount * tokenPct) / 100, status: 'pending' },
        {
          milestone: 'On Material Delivery',
          duePct: deliveryPct,
          dueAmount: (netAmount * deliveryPct) / 100,
          status: 'pending',
        },
        {
          milestone: 'On Installation',
          duePct: installPct,
          dueAmount: (netAmount * installPct) / 100,
          status: 'pending',
        },
        {
          milestone: 'On Subsidy Release',
          duePct: subsidyPct,
          dueAmount: (netAmount * subsidyPct) / 100,
          status: 'pending',
        },
      ],
      isFinanced: false,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.quotationId, {
      status: 'converted_to_order',
      customerId,
      updatedAt: now,
    });
    await ctx.db.patch(quotation.leadId, { status: 'won', updatedAt: now });
    await ctx.db.insert('leadActivities', {
      leadId: quotation.leadId,
      type: 'status_change',
      content: `Sales order ${orderNumber} confirmed from quotation ${quotation.quotationNumber}`,
      doneByUserId: user._id,
      createdAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'convert',
      entityType: 'salesOrders',
      entityId: orderId as string,
      newValues: { quotationId: args.quotationId, orderNumber },
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
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error('Lead not found');
    assertLeadForQuotation(lead);

    const completedSurvey = await getCompletedSurveyForLead(ctx, args.leadId);
    if (!completedSurvey && lead.status !== 'interested' && lead.status !== 'contacted') {
      throw new Error('Complete site survey before creating quotation');
    }

    const surveyId = args.surveyId ?? completedSurvey?._id;

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
      surveyId,
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
      termsAndConditions: args.termsAndConditions ?? DEFAULT_TERMS,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('leadActivities', {
      leadId: args.leadId,
      type: 'note',
      content: `Quotation ${quotationNumber} drafted (${capacityKw} kWp)`,
      doneByUserId: user._id,
      createdAt: now,
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

export const updateQuotation = mutation({
  args: {
    quotationId: v.id('quotations'),
    systemCapacityKw: v.optional(v.number()),
    panelCount: v.optional(v.number()),
    validTill: v.optional(v.number()),
    termsAndConditions: v.optional(v.string()),
    tokenAmountPct: v.optional(v.number()),
    onDeliveryPct: v.optional(v.number()),
    onInstallationPct: v.optional(v.number()),
    onSubsidyPct: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status !== 'draft' && quotation.status !== 'under_negotiation') {
      throw new Error('Only draft quotations can be edited');
    }

    const { quotationId, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }

    if (updates.systemCapacityKw) {
      const kw = updates.systemCapacityKw;
      let subsidyAmount = 0;
      let subsidyCategory: 'upto_2kw' | '2_3kw' | 'above_3kw' = 'upto_2kw';
      if (kw <= 2) subsidyAmount = kw * 30000;
      else if (kw <= 3) subsidyAmount = 2 * 30000 + (kw - 2) * 18000;
      else {
        subsidyAmount = 78000;
        subsidyCategory = 'above_3kw';
      }
      patch.subsidyEligibleCapacityKw = Math.min(kw, 3);
      patch.subsidyCategory = subsidyCategory;
      patch.subsidyAmountEstimated = subsidyAmount;
      patch.netAmountAfterSubsidy = quotation.totalAmount - subsidyAmount;
    }

    await ctx.db.patch(quotationId, patch);
    await logAudit(ctx, {
      userId: user._id,
      action: 'update',
      entityType: 'quotations',
      entityId: quotationId as string,
      newValues: patch,
    });
  },
});

export const deleteQuotation = mutation({
  args: { quotationId: v.id('quotations') },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status !== 'draft') throw new Error('Only draft quotations can be deleted');

    await ctx.db.delete(args.quotationId);
    await logAudit(ctx, {
      userId: user._id,
      action: 'delete',
      entityType: 'quotations',
      entityId: args.quotationId as string,
    });
  },
});
