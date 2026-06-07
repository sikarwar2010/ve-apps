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

export const updateOrder = mutation({
  args: {
    orderId: v.id('salesOrders'),
    status: v.optional(orderStatus),
    expectedInstallationDate: v.optional(v.number()),
    isFinanced: v.optional(v.boolean()),
    financierName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error('Order not found');

    const { orderId, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }

    await ctx.db.patch(orderId, patch);
    await logAudit(ctx, {
      userId: user._id,
      action: 'update',
      entityType: 'salesOrders',
      entityId: orderId as string,
      newValues: patch,
    });
  },
});

export const cancelOrder = mutation({
  args: { orderId: v.id('salesOrders'), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error('Order not found');
    if (order.status === 'completed') throw new Error('Cannot cancel completed order');
    if (order.status === 'cancelled') throw new Error('Order already cancelled');

    await ctx.db.patch(args.orderId, {
      status: 'cancelled',
      updatedAt: Date.now(),
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'cancel',
      entityType: 'salesOrders',
      entityId: args.orderId as string,
      newValues: { reason: args.reason },
    });
  },
});

export const deleteOrder = mutation({
  args: { orderId: v.id('salesOrders') },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'draft') throw new Error('Only draft orders can be deleted');

    await ctx.db.delete(args.orderId);
    await logAudit(ctx, {
      userId: user._id,
      action: 'delete',
      entityType: 'salesOrders',
      entityId: args.orderId as string,
    });
  },
});
