import { logAudit } from '@/lib/audit';
import { generateDocumentNumber } from '@/lib/numbering';
import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { getOrCreateUser } from '../lib/auth';

const leadStatus = v.union(
  v.literal('new'),
  v.literal('contacted'),
  v.literal('interested'),
  v.literal('survey_scheduled'),
  v.literal('survey_completed'),
  v.literal('quotation_sent'),
  v.literal('negotiation'),
  v.literal('won'),
  v.literal('lost'),
);

const leadSource = v.union(
  v.literal('website'),
  v.literal('meta_ads'),
  v.literal('google_ads'),
  v.literal('walk_in'),
  v.literal('referral'),
  v.literal('electrician_partner'),
  v.literal('builder_channel'),
  v.literal('manual'),
);

const rooftopType = v.optional(v.union(v.literal('rcc'), v.literal('tin'), v.literal('asbestos'), v.literal('other')));

const propertyType = v.optional(v.union(v.literal('residential'), v.literal('commercial'), v.literal('industrial')));

const leadActivityType = v.union(
  v.literal('note'),
  v.literal('call'),
  v.literal('whatsapp'),
  v.literal('email'),
  v.literal('visit'),
  v.literal('status_change'),
  v.literal('follow_up_set'),
  v.literal('task'),
);

// ---- QUERIES ----

export const listLeads = query({
  args: {
    status: v.optional(leadStatus),
    assignedToUserId: v.optional(v.id('users')),
    branchId: v.optional(v.id('branches')),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    let leads;

    if (args.status) {
      leads = await ctx.db
        .query('leads')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    } else if (args.assignedToUserId) {
      leads = await ctx.db
        .query('leads')
        .withIndex('by_assigned', (q) => q.eq('assignedToUserId', args.assignedToUserId!))
        .order('desc')
        .take(limit);
    } else {
      leads = await ctx.db.query('leads').order('desc').take(limit);
    }

    // Enrich with assigned user
    const enriched = await Promise.all(
      leads.map(async (lead) => {
        const assignedTo = lead.assignedToUserId ? await ctx.db.get(lead.assignedToUserId) : null;
        return { ...lead, assignedTo };
      }),
    );

    return enriched;
  },
});

export const getLeadById = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) return null;

    const activities = await ctx.db
      .query('leadActivities')
      .withIndex('by_lead', (q) => q.eq('leadId', args.leadId))
      .order('desc')
      .collect();

    const assignedTo = lead.assignedToUserId ? await ctx.db.get(lead.assignedToUserId) : null;

    return { ...lead, activities, assignedTo };
  },
});

export const getLeadKanban = query({
  args: { branchId: v.optional(v.id('branches')) },
  handler: async (ctx, args) => {
    const statuses = [
      'new',
      'contacted',
      'interested',
      'survey_scheduled',
      'survey_completed',
      'quotation_sent',
      'negotiation',
    ] as const;

    const columns = await Promise.all(
      statuses.map(async (status) => {
        const leads = await ctx.db
          .query('leads')
          .withIndex('by_status', (q) => q.eq('status', status))
          .take(20);
        return { status, leads, count: leads.length };
      }),
    );

    return columns;
  },
});

// ---- MUTATIONS ----

export const createLead = mutation({
  args: {
    source: leadSource,
    name: v.string(),
    mobile: v.string(),
    email: v.optional(v.string()),
    addressLine1: v.string(),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    electricityBillAmt: v.optional(v.number()),
    monthlyConsumptionKwh: v.optional(v.number()),
    rooftopType,
    propertyType,
    discomName: v.optional(v.string()),
    expectedCapacityKw: v.optional(v.number()),
    assignedToUserId: v.optional(v.id('users')),
    branchId: v.optional(v.id('branches')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await getOrCreateUser(ctx);

    // Check duplicate mobile
    const existing = await ctx.db
      .query('leads')
      .withIndex('by_mobile', (q) => q.eq('mobile', args.mobile))
      .first();
    if (existing) throw new Error(`Lead already exists with this mobile: ${existing.leadNumber}`);

    const leadNumber = await generateDocumentNumber(ctx, 'LEAD');
    const now = Date.now();

    const leadId = await ctx.db.insert('leads', {
      ...args,
      leadNumber,
      status: 'new',
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'create',
      entityType: 'leads',
      entityId: leadId as string,
      newValues: args,
    });

    return leadId;
  },
});

export const updateLeadStatus = mutation({
  args: {
    leadId: v.id('leads'),
    status: leadStatus,
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await getOrCreateUser(ctx);

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error('Lead not found');

    const oldStatus = lead.status;
    await ctx.db.patch(args.leadId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Add activity
    await ctx.db.insert('leadActivities', {
      leadId: args.leadId,
      type: 'status_change',
      content: `Status changed from ${oldStatus} to ${args.status}`,
      outcome: args.remarks,
      doneByUserId: user._id,
      createdAt: Date.now(),
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'status_change',
      entityType: 'leads',
      entityId: args.leadId as string,
      oldValues: { status: oldStatus },
      newValues: { status: args.status },
    });
  },
});

export const addLeadActivity = mutation({
  args: {
    leadId: v.id('leads'),
    type: leadActivityType,
    content: v.string(),
    outcome: v.optional(v.string()),
    followUpAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');
    const user = await getOrCreateUser(ctx);

    return ctx.db.insert('leadActivities', {
      leadId: args.leadId,
      type: args.type,
      content: args.content,
      outcome: args.outcome,
      followUpAt: args.followUpAt,
      doneByUserId: user._id,
      createdAt: Date.now(),
    });
  },
});
