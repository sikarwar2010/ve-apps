import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { logAudit } from '../lib/audit';
import { getOrCreateUser } from '../lib/auth';
import { generateDocumentNumber } from '../lib/numbering';

export const listSubsidyApplications = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const apps = await ctx.db.query('subsidyApplications').order('desc').take(limit);

    return Promise.all(
      apps.map(async (a) => {
        const customer = await ctx.db.get(a.customerId);
        const order = await ctx.db.get(a.salesOrderId);
        return { ...a, customer, order };
      }),
    );
  },
});

export const getSubsidyById = query({
  args: { applicationId: v.id('subsidyApplications') },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.applicationId);
    if (!app) return null;
    const customer = await ctx.db.get(app.customerId);
    const order = await ctx.db.get(app.salesOrderId);
    return { ...app, customer, order };
  },
});

export const createSubsidyApplication = mutation({
  args: {
    salesOrderId: v.id('salesOrders'),
    customerId: v.id('customers'),
    systemCapacityKw: v.number(),
    subsidyCategory: v.union(v.literal('upto_2kw'), v.literal('2_3kw'), v.literal('above_3kw')),
    subsidyAmountEligible: v.number(),
    aadhaarNumber: v.string(),
    panNumber: v.optional(v.string()),
    bankAccountNumber: v.string(),
    bankIfsc: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const now = Date.now();
    const applicationNumber = await generateDocumentNumber(ctx, 'SUB');

    const id = await ctx.db.insert('subsidyApplications', {
      applicationNumber,
      salesOrderId: args.salesOrderId,
      customerId: args.customerId,
      status: 'draft',
      systemCapacityKw: args.systemCapacityKw,
      subsidyCategory: args.subsidyCategory,
      subsidyAmountEligible: args.subsidyAmountEligible,
      aadhaarNumber: args.aadhaarNumber,
      panNumber: args.panNumber,
      bankAccountNumber: args.bankAccountNumber,
      bankIfsc: args.bankIfsc,
      coordinatorId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'create',
      entityType: 'subsidyApplications',
      entityId: id as string,
    });

    return id;
  },
});

export const updateSubsidyStatus = mutation({
  args: {
    applicationId: v.id('subsidyApplications'),
    status: v.union(
      v.literal('draft'),
      v.literal('documents_collected'),
      v.literal('submitted_to_portal'),
      v.literal('under_review'),
      v.literal('inspection_pending'),
      v.literal('inspection_done'),
      v.literal('approved'),
      v.literal('payment_pending'),
      v.literal('paid'),
      v.literal('rejected'),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    await ctx.db.patch(args.applicationId, { status: args.status, updatedAt: Date.now() });
    await logAudit(ctx, {
      userId: user._id,
      action: 'status_change',
      entityType: 'subsidyApplications',
      entityId: args.applicationId as string,
      newValues: { status: args.status },
    });
  },
});

export const listNetMeterApplications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const apps = await ctx.db.query('netMeterApplications').order('desc').take(limit);

    return Promise.all(
      apps.map(async (a) => ({
        ...a,
        customer: await ctx.db.get(a.customerId),
      })),
    );
  },
});
