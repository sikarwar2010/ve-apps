import { v } from 'convex/values';
import { query } from '../_generated/server';

export const listProducts = query({
  args: { category: v.optional(v.string()), activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    let products = args.category
      ? await ctx.db
          .query('products')
          .withIndex('by_category', (q) => q.eq('category', args.category as any))
          .collect()
      : await ctx.db.query('products').collect();

    if (args.activeOnly !== false) {
      products = products.filter((p) => p.isActive);
    }

    return products.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getProductById = query({
  args: { productId: v.id('products') },
  handler: async (ctx, args) => ctx.db.get(args.productId),
});
