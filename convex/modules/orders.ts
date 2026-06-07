import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { logAudit } from '../lib/audit';
import { getOrCreateUser } from '../lib/auth';

const orderStatus = v.union(
  v.literal('draft'),
  v.literal('confirmed'),
  v.literal('in_procurement'),
  v.literal('ready_for_dispatch'),
  v.literal('dispatched'),
  v.literal('installation_pending'),
  v.literal('installed'),
  v.literal('net_meter_pending'),
  v.literal('subsidy_pending'),
  v.literal('completed'),
  v.literal('cancelled'),
);

export const listOrders = query({
  args: { status: v.optional(orderStatus), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const orders = args.status
      ? await ctx.db
          .query('salesOrders')
          .withIndex('by_status', (q) => q.eq('status', args.status!))
          .order('desc')
          .take(limit)
      : await ctx.db.query('salesOrders').order('desc').take(limit);

    return Promise.all(
      orders.map(async (o) => {
        const customer = await ctx.db.get(o.customerId);
        const lead = await ctx.db.get(o.leadId);
        return { ...o, customer, lead };
      }),
    );
  },
});

export const getOrderById = query({
  args: { orderId: v.id('salesOrders') },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const customer = await ctx.db.get(order.customerId);
    const quotation = await ctx.db.get(order.quotationId);
    const lead = await ctx.db.get(order.leadId);
    return { ...order, customer, quotation, lead };
  },
});

export const updateOrderStatus = mutation({
  args: { orderId: v.id('salesOrders'), status: orderStatus },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error('Order not found');

    await ctx.db.patch(args.orderId, { status: args.status, updatedAt: Date.now() });

    await logAudit(ctx, {
      userId: user._id,
      action: 'status_change',
      entityType: 'salesOrders',
      entityId: args.orderId as string,
      newValues: { status: args.status },
    });
  },
});
