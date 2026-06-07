import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { logAudit } from '../lib/audit';
import { getOrCreateUser } from '../lib/auth';
import { generateDocumentNumber } from '../lib/numbering';

export const listCustomers = query({
  args: { search: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 100;
    let customers = await ctx.db.query('customers').order('desc').take(limit);

    if (args.search) {
      const q = args.search.toLowerCase();
      customers = customers.filter(
        (c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q) || c.customerNumber.toLowerCase().includes(q),
      );
    }

    return Promise.all(
      customers.map(async (c) => ({
        ...c,
        accountManager: c.accountManagerId ? await ctx.db.get(c.accountManagerId) : null,
      })),
    );
  },
});

export const getCustomerById = query({
  args: { customerId: v.id('customers') },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) return null;
    const accountManager = customer.accountManagerId ? await ctx.db.get(customer.accountManagerId) : null;
    const lead = customer.leadId ? await ctx.db.get(customer.leadId) : null;
    return { ...customer, accountManager, lead };
  },
});

export const convertLeadToCustomer = mutation({
  args: {
    leadId: v.id('leads'),
    discomName: v.string(),
    discomConsumerNo: v.string(),
    propertyType: v.union(v.literal('residential'), v.literal('commercial'), v.literal('industrial')),
    aadhaarNumber: v.optional(v.string()),
    panNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error('Lead not found');

    const existing = await ctx.db
      .query('customers')
      .withIndex('by_mobile', (q) => q.eq('mobile', lead.mobile))
      .first();
    if (existing) throw new Error(`Customer already exists: ${existing.customerNumber}`);

    const branch = lead.branchId ? await ctx.db.get(lead.branchId) : await ctx.db.query('branches').first();
    if (!branch) throw new Error('No branch configured. Run organization setup first.');

    const now = Date.now();
    const customerNumber = await generateDocumentNumber(ctx, 'CUST');

    const customerId = await ctx.db.insert('customers', {
      customerNumber,
      leadId: args.leadId,
      name: lead.name,
      mobile: lead.mobile,
      email: lead.email,
      addressLine1: lead.addressLine1,
      city: lead.city,
      state: lead.state,
      pincode: lead.pincode,
      aadhaarNumber: args.aadhaarNumber,
      panNumber: args.panNumber,
      propertyType: args.propertyType,
      discomName: args.discomName,
      discomConsumerNo: args.discomConsumerNo,
      branchId: branch._id,
      accountManagerId: lead.assignedToUserId ?? user._id,
      kycVerified: false,
      isActive: true,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.leadId, { status: 'interested', updatedAt: now });
    await ctx.db.insert('leadActivities', {
      leadId: args.leadId,
      type: 'status_change',
      content: `Lead converted to customer ${customerNumber} (KYC in progress)`,
      doneByUserId: user._id,
      createdAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'convert',
      entityType: 'customers',
      entityId: customerId as string,
      newValues: { leadId: args.leadId, customerNumber },
    });

    return customerId;
  },
});
