import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { getOrCreateUser } from '../lib/auth';

export const listMyNotifications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .first();
    if (!user) return [];

    const limit = args.limit ?? 20;
    return ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(limit);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .first();
    if (!user) return 0;

    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) => q.eq('userId', user._id).eq('isRead', false))
      .collect();

    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await getOrCreateUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) throw new Error('Not found');

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await getOrCreateUser(ctx);
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_unread', (q) => q.eq('userId', user._id).eq('isRead', false))
      .collect();

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { isRead: true })));
  },
});

export const seedWelcomeNotification = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);

    const existing = await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();
    if (existing) return;

    await ctx.db.insert('notifications', {
      userId: user._id,
      title: 'Welcome to SuryaERP',
      message: 'Your CRM pipeline is live. Create your first lead to get started.',
      type: 'success',
      entityType: 'leads',
      isRead: false,
      createdAt: Date.now(),
    });
  },
});
