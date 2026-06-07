import { v } from 'convex/values';
import { query } from '../_generated/server';

export const listInventory = query({
  args: { warehouseId: v.optional(v.id('warehouses')) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const stocks = args.warehouseId
      ? await ctx.db
          .query('inventory')
          .withIndex('by_warehouse', (q) => q.eq('warehouseId', args.warehouseId!))
          .collect()
      : await ctx.db.query('inventory').collect();

    return Promise.all(
      stocks.map(async (stock) => {
        const product = await ctx.db.get(stock.productId);
        const warehouse = await ctx.db.get(stock.warehouseId);
        const isLow = product?.minStockLevel != null && stock.availableQty <= product.minStockLevel;
        return { ...stock, product, warehouse, isLow };
      }),
    );
  },
});

export const listStockMovements = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const movements = (await ctx.db.query('stockMovements').collect())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return Promise.all(
      movements.map(async (m) => ({
        ...m,
        product: await ctx.db.get(m.productId),
        warehouse: await ctx.db.get(m.warehouseId),
        doneBy: await ctx.db.get(m.doneByUserId),
      })),
    );
  },
});

export const getLowStockAlerts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const allStock = await ctx.db.query('inventory').collect();
    const alerts = [];

    for (const stock of allStock) {
      const product = await ctx.db.get(stock.productId);
      if (!product?.minStockLevel) continue;
      if (stock.availableQty <= product.minStockLevel) {
        alerts.push({
          ...stock,
          product,
          shortage: product.minStockLevel - stock.availableQty,
        });
      }
    }

    return alerts.sort((a, b) => a.availableQty - b.availableQty);
  },
});

export const listWarehouses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    return ctx.db.query('warehouses').collect();
  },
});
