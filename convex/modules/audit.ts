import { v } from 'convex/values';
import { query } from '../_generated/server';

export const listAuditLogs = query({
  args: {
    entityType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 100;
    let logs = args.entityType
      ? await ctx.db
          .query('auditLogs')
          .withIndex('by_entity', (q) => q.eq('entityType', args.entityType!))
          .order('desc')
          .take(limit)
      : await ctx.db.query('auditLogs').withIndex('by_createdAt').order('desc').take(limit);

    return Promise.all(
      logs.map(async (log) => ({
        ...log,
        user: await ctx.db.get(log.userId),
      })),
    );
  },
});
