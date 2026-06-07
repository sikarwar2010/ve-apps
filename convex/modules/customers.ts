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
    customers = customers.filter((c) => c.isActive);

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

export const createCustomer = mutation({
  args: {
    name: v.string(),
    mobile: v.string(),
    email: v.optional(v.string()),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    propertyType: v.union(v.literal('residential'), v.literal('commercial'), v.literal('industrial')),
    discomName: v.string(),
    discomConsumerNo: v.string(),
    aadhaarNumber: v.optional(v.string()),
    panNumber: v.optional(v.string()),
    gstin: v.optional(v.string()),
    bankAccountName: v.optional(v.string()),
    bankAccountNumber: v.optional(v.string()),
    bankIfsc: v.optional(v.string()),
    bankName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);

    const existing = await ctx.db
      .query('customers')
      .withIndex('by_mobile', (q) => q.eq('mobile', args.mobile))
      .first();
    if (existing) throw new Error(`Customer exists: ${existing.customerNumber}`);

    const branch = await ctx.db.query('branches').first();
    if (!branch) throw new Error('No branch configured');

    const now = Date.now();
    const customerNumber = await generateDocumentNumber(ctx, 'CUST');

    const customerId = await ctx.db.insert('customers', {
      customerNumber,
      name: args.name,
      mobile: args.mobile,
      email: args.email,
      addressLine1: args.addressLine1,
      addressLine2: args.addressLine2,
      city: args.city,
      state: args.state,
      pincode: args.pincode,
      propertyType: args.propertyType,
      discomName: args.discomName,
      discomConsumerNo: args.discomConsumerNo,
      aadhaarNumber: args.aadhaarNumber,
      panNumber: args.panNumber,
      gstin: args.gstin,
      bankAccountName: args.bankAccountName,
      bankAccountNumber: args.bankAccountNumber,
      bankIfsc: args.bankIfsc,
      bankName: args.bankName,
      branchId: branch._id,
      accountManagerId: user._id,
      kycVerified: false,
      isActive: true,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'create',
      entityType: 'customers',
      entityId: customerId as string,
    });

    return customerId;
  },
});

export const updateCustomer = mutation({
  args: {
    customerId: v.id('customers'),
    name: v.optional(v.string()),
    mobile: v.optional(v.string()),
    altMobile: v.optional(v.string()),
    email: v.optional(v.string()),
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    pincode: v.optional(v.string()),
    propertyType: v.optional(v.union(v.literal('residential'), v.literal('commercial'), v.literal('industrial'))),
    discomName: v.optional(v.string()),
    discomConsumerNo: v.optional(v.string()),
    aadhaarNumber: v.optional(v.string()),
    panNumber: v.optional(v.string()),
    gstin: v.optional(v.string()),
    bankAccountName: v.optional(v.string()),
    bankAccountNumber: v.optional(v.string()),
    bankIfsc: v.optional(v.string()),
    bankName: v.optional(v.string()),
    kycVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error('Customer not found');

    const { customerId, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) patch[key] = val;
    }

    await ctx.db.patch(customerId, patch);
    await logAudit(ctx, {
      userId: user._id,
      action: 'update',
      entityType: 'customers',
      entityId: customerId as string,
      newValues: patch,
    });
  },
});

export const deleteCustomer = mutation({
  args: { customerId: v.id('customers') },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error('Customer not found');

    const orders = await ctx.db
      .query('salesOrders')
      .withIndex('by_customer', (q) => q.eq('customerId', args.customerId))
      .first();
    if (orders) throw new Error('Cannot delete customer with sales orders. Deactivate instead.');

    await ctx.db.patch(args.customerId, { isActive: false, updatedAt: Date.now() });
    await logAudit(ctx, {
      userId: user._id,
      action: 'deactivate',
      entityType: 'customers',
      entityId: args.customerId as string,
    });
  },
});
