import { v } from 'convex/values';
import { query } from '../_generated/server';

export const getMISReport = query({
  args: {
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const now = Date.now();
    const fromDate = args.fromDate ?? now - 30 * 86400000;
    const toDate = args.toDate ?? now;

    const leads = (await ctx.db.query('leads').collect()).filter(
      (l) => l.createdAt >= fromDate && l.createdAt <= toDate,
    );
    const orders = (await ctx.db.query('salesOrders').collect()).filter(
      (o) => o.createdAt >= fromDate && o.createdAt <= toDate,
    );
    const payments = (await ctx.db.query('payments').collect()).filter(
      (p) => p.type === 'received' && p.paymentDate >= fromDate && p.paymentDate <= toDate,
    );
    const installations = (await ctx.db.query('installationJobs').collect()).filter(
      (j) => j.createdAt >= fromDate && j.createdAt <= toDate,
    );

    const sourceBreakdown: Record<string, number> = {};
    for (const lead of leads) {
      sourceBreakdown[lead.source] = (sourceBreakdown[lead.source] ?? 0) + 1;
    }

    const wonLeads = leads.filter((l) => l.status === 'won').length;
    const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 1000) / 10 : 0;

    const ordersByStatus: Record<string, number> = {};
    for (const order of orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;
    }

    const totalKwInstalled = installations
      .filter((j) => j.status === 'completed' || j.status === 'customer_signoff')
      .reduce((s, j) => s + j.systemCapacityKw, 0);

    return {
      period: { from: fromDate, to: toDate },
      leads: { total: leads.length, won: wonLeads, conversionRate, bySource: sourceBreakdown },
      orders: {
        total: orders.length,
        totalValue: orders.reduce((s, o) => s + o.totalAmount, 0),
        byStatus: ordersByStatus,
      },
      revenue: { totalCollected: payments.reduce((s, p) => s + p.amount, 0) },
      operations: { totalJobs: installations.length, totalKwInstalled },
    };
  },
});

export const getMonthlyRevenueChart = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const year = args.year ?? new Date().getFullYear();
    const yearStart = new Date(year, 0, 1).getTime();
    const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: new Date(year, i, 1).toLocaleString('en-IN', { month: 'short' }),
      revenue: 0,
      orders: 0,
    }));

    const payments = (await ctx.db.query('payments').collect()).filter(
      (p) => p.type === 'received' && p.paymentDate >= yearStart && p.paymentDate <= yearEnd,
    );
    for (const p of payments) {
      monthly[new Date(p.paymentDate).getMonth()].revenue += p.amount;
    }

    const orders = (await ctx.db.query('salesOrders').collect()).filter(
      (o) => o.createdAt >= yearStart && o.createdAt <= yearEnd,
    );
    for (const o of orders) {
      monthly[new Date(o.createdAt).getMonth()].orders += 1;
    }

    return monthly;
  },
});
