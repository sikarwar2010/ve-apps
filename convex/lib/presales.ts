import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import type { DataModel, Doc, Id } from '../_generated/dataModel';

type Ctx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

const QUOTATION_ELIGIBLE = new Set(['survey_completed', 'interested', 'quotation_sent', 'negotiation', 'contacted']);

const SURVEY_ELIGIBLE = new Set(['new', 'contacted', 'interested', 'survey_scheduled']);

export function assertLeadOpen(lead: Doc<'leads'>) {
  if (lead.status === 'won') throw new Error('Lead is already won. Create order from approved quotation.');
  if (lead.status === 'lost') throw new Error('Lead is marked lost. Re-open lead before continuing.');
}

export function assertLeadForSurvey(lead: Doc<'leads'>) {
  assertLeadOpen(lead);
  if (!SURVEY_ELIGIBLE.has(lead.status)) {
    throw new Error(`Cannot schedule survey for lead in status: ${lead.status}`);
  }
}

export function assertLeadForQuotation(lead: Doc<'leads'>) {
  assertLeadOpen(lead);
  if (!QUOTATION_ELIGIBLE.has(lead.status)) {
    throw new Error(`Complete site survey before quoting. Lead status "${lead.status}" is not eligible for quotation.`);
  }
}

export async function getCompletedSurveyForLead(ctx: Ctx, leadId: Id<'leads'>): Promise<Doc<'surveys'> | null> {
  const surveys = await ctx.db
    .query('surveys')
    .withIndex('by_lead', (q) => q.eq('leadId', leadId))
    .collect();
  return surveys.find((s) => s.status === 'completed') ?? null;
}

export async function getOrCreateCustomerFromLead(
  ctx: GenericMutationCtx<DataModel>,
  lead: Doc<'leads'>,
  userId: Id<'users'>,
  generateNumber: (prefix: string) => Promise<string>,
): Promise<Id<'customers'>> {
  const existing = await ctx.db
    .query('customers')
    .withIndex('by_mobile', (q) => q.eq('mobile', lead.mobile))
    .first();
  if (existing) return existing._id;

  const branch = lead.branchId ? await ctx.db.get(lead.branchId) : await ctx.db.query('branches').first();
  if (!branch) throw new Error('No branch configured');

  const now = Date.now();
  const customerNumber = await generateNumber('CUST');

  return ctx.db.insert('customers', {
    customerNumber,
    leadId: lead._id,
    name: lead.name,
    mobile: lead.mobile,
    email: lead.email,
    addressLine1: lead.addressLine1,
    city: lead.city,
    state: lead.state,
    pincode: lead.pincode,
    propertyType: lead.propertyType ?? 'residential',
    discomName: lead.discomName ?? 'To be confirmed',
    discomConsumerNo: 'Pending',
    branchId: branch._id,
    accountManagerId: lead.assignedToUserId ?? userId,
    kycVerified: false,
    isActive: true,
    createdByUserId: userId,
    createdAt: now,
    updatedAt: now,
  });
}
