import { v } from 'convex/values';
import { query } from '../_generated/server';

export const listInvoices = query({
  args: { status: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const invoices = await ctx.db.query('invoices').order('desc').take(limit);

    return Promise.all(
      invoices.map(async (inv) => ({
        ...inv,
        customer: await ctx.db.get(inv.customerId),
      })),
    );
  },
});

export const listPayments = query({
  args: { type: v.optional(v.union(v.literal('received'), v.literal('made'))), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const payments = (await ctx.db.query('payments').collect())
      .filter((p) => !args.type || p.type === args.type)
      .sort((a, b) => b.paymentDate - a.paymentDate)
      .slice(0, limit);

    return Promise.all(
      payments.map(async (p) => ({
        ...p,
        customer: p.customerId ? await ctx.db.get(p.customerId) : null,
        vendor: p.vendorId ? await ctx.db.get(p.vendorId) : null,
      })),
    );
  },
});

export const getAgingReceivables = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const invoices = (await ctx.db.query('invoices').collect()).filter(
      (i) => i.status !== 'paid' && i.status !== 'cancelled',
    );

    const now = Date.now();
    const buckets = {
      current: [] as typeof invoices,
      days1_30: [] as typeof invoices,
      days31_60: [] as typeof invoices,
      days61_90: [] as typeof invoices,
      above90: [] as typeof invoices,
    };

    for (const inv of invoices) {
      const overdueDays = Math.floor((now - inv.dueDate) / 86400000);
      if (overdueDays <= 0) buckets.current.push(inv);
      else if (overdueDays <= 30) buckets.days1_30.push(inv);
      else if (overdueDays <= 60) buckets.days31_60.push(inv);
      else if (overdueDays <= 90) buckets.days61_90.push(inv);
      else buckets.above90.push(inv);
    }

    const sum = (arr: typeof invoices) => arr.reduce((s, i) => s + i.balanceDue, 0);

    return {
      current: { count: buckets.current.length, amount: sum(buckets.current) },
      days1_30: { count: buckets.days1_30.length, amount: sum(buckets.days1_30) },
      days31_60: { count: buckets.days31_60.length, amount: sum(buckets.days31_60) },
      days61_90: { count: buckets.days61_90.length, amount: sum(buckets.days61_90) },
      above90: { count: buckets.above90.length, amount: sum(buckets.above90) },
      totalOutstanding: sum(invoices),
    };
  },
});
