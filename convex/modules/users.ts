import { v } from 'convex/values';

import { mutation, query } from '../_generated/server';
import { getOrCreateUser } from '../lib/auth';

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkId) {
      return null;
    }

    return ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
      .unique();
  },
});

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);
    return user._id;
  },
});
