import { mutation } from '../_generated/server';
import { getOrCreateUser } from '../lib/auth';

/** Bootstrap org structure on first login — company, branch, warehouse */
export const ensureOrganization = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getOrCreateUser(ctx);
    const now = Date.now();

    let company = await ctx.db.query('company').first();
    if (!company) {
      await ctx.db.insert('company', {
        name: 'Surya Solar Dealership',
        legalName: 'Surya Solar Dealership Pvt Ltd',
        gstin: '08AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
        addressLine1: 'Solar Park, MI Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        email: 'info@suryaerp.in',
        phone: '+91 98765 43210',
        website: 'https://suryaerp.in',
        bankAccounts: [
          {
            bankName: 'State Bank of India',
            accountNumber: '123456789012',
            ifsc: 'SBIN0001234',
            branch: 'MI Road, Jaipur',
            accountType: 'Current',
            isPrimary: true,
          },
        ],
        oemDealerships: [{ oemName: 'Waaree', dealerCode: 'WR-JPR-001', region: 'North' }],
        createdAt: now,
        updatedAt: now,
      });
    }

    let branch = await ctx.db.query('branches').first();
    if (!branch) {
      const branchId = await ctx.db.insert('branches', {
        name: 'Head Office',
        code: 'HO',
        address: 'Solar Park, MI Road, Jaipur',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        phone: '+91 98765 43210',
        managerUserId: user._id,
        isActive: true,
        createdAt: now,
      });
      branch = await ctx.db.get(branchId);
    }

    if (branch) {
      const warehouse = await ctx.db
        .query('warehouses')
        .withIndex('by_branch', (q) => q.eq('branchId', branch!._id))
        .first();
      if (!warehouse) {
        await ctx.db.insert('warehouses', {
          name: 'Main Warehouse',
          code: 'WH-HO',
          branchId: branch._id,
          address: 'Solar Park, MI Road, Jaipur',
          city: 'Jaipur',
          pincode: '302001',
          managerId: user._id,
          isActive: true,
          createdAt: now,
        });
      }
    }

    // Seed default solar SKUs if catalog empty
    const existingProduct = await ctx.db.query('products').first();
    if (!existingProduct) {
      const catalog = [
        {
          sku: 'PNL-540-WA',
          name: '540W Mono PERC Panel',
          category: 'panel' as const,
          brand: 'Waaree',
          model: '540W',
          unit: 'Nos',
          hsnCode: '85414011',
          gstRate: 12,
          mrp: 18500,
          standardCost: 14200,
          trackSerial: true,
          trackBatch: false,
          minStockLevel: 50,
          reorderQty: 100,
        },
        {
          sku: 'INV-5K-GT',
          name: '5kW Grid-Tie Inverter',
          category: 'inverter' as const,
          brand: 'Growatt',
          model: 'MIN 5000TL-X',
          unit: 'Nos',
          hsnCode: '85044090',
          gstRate: 12,
          mrp: 42000,
          standardCost: 32000,
          trackSerial: true,
          trackBatch: false,
          minStockLevel: 10,
          reorderQty: 20,
        },
        {
          sku: 'STR-RCC-5K',
          name: 'RCC Structure 5kW',
          category: 'structure' as const,
          brand: 'Generic',
          model: 'Standard',
          unit: 'Set',
          hsnCode: '73089090',
          gstRate: 18,
          mrp: 28000,
          standardCost: 22000,
          trackSerial: false,
          trackBatch: false,
          minStockLevel: 5,
          reorderQty: 10,
        },
        {
          sku: 'LAB-INST-STD',
          name: 'Installation & Commissioning',
          category: 'labor' as const,
          brand: 'In-house',
          model: 'Standard',
          unit: 'Job',
          hsnCode: '9987',
          gstRate: 18,
          mrp: 15000,
          standardCost: 8000,
          trackSerial: false,
          trackBatch: false,
        },
      ];

      for (const p of catalog) {
        await ctx.db.insert('products', {
          ...p,
          isActive: true,
          createdByUserId: user._id,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { ok: true };
  },
});
