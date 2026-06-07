import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { logAudit } from '../lib/audit';
import { getOrCreateUser } from '../lib/auth';
import { generateDocumentNumber } from '../lib/numbering';

export const listServiceTickets = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const tickets = await ctx.db.query('serviceTickets').order('desc').take(limit);

    return Promise.all(
      tickets.map(async (t) => ({
        ...t,
        customer: await ctx.db.get(t.customerId),
        assignedTo: t.assignedTechnicianId ? await ctx.db.get(t.assignedTechnicianId) : null,
      })),
    );
  },
});

export const createServiceTicket = mutation({
  args: {
    customerId: v.id('customers'),
    salesOrderId: v.optional(v.id('salesOrders')),
    type: v.union(v.literal('complaint'), v.literal('warranty_claim'), v.literal('amc'), v.literal('general_service')),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')),
    subject: v.string(),
    description: v.string(),
    isUnderWarranty: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const now = Date.now();
    const ticketNumber = await generateDocumentNumber(ctx, 'TKT');

    const id = await ctx.db.insert('serviceTickets', {
      ticketNumber,
      customerId: args.customerId,
      salesOrderId: args.salesOrderId,
      type: args.type,
      priority: args.priority,
      status: 'open',
      subject: args.subject,
      description: args.description,
      assignedTechnicianId: user._id,
      isUnderWarranty: args.isUnderWarranty ?? false,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'create',
      entityType: 'serviceTickets',
      entityId: id as string,
    });

    return id;
  },
});

export const listInstallationJobs = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const jobs = await ctx.db.query('installationJobs').order('desc').take(limit);

    return Promise.all(
      jobs.map(async (j) => ({
        ...j,
        customer: await ctx.db.get(j.customerId),
        technician: await ctx.db.get(j.leadTechnicianId),
      })),
    );
  },
});

export const listDispatches = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const dispatches = await ctx.db.query('dispatches').order('desc').take(limit);

    return Promise.all(
      dispatches.map(async (d) => ({
        ...d,
        order: await ctx.db.get(d.salesOrderId),
      })),
    );
  },
});
