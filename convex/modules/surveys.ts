import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { logAudit } from '../lib/audit';
import { getOrCreateUser } from '../lib/auth';
import { generateDocumentNumber } from '../lib/numbering';

const surveyStatus = v.union(
  v.literal('scheduled'),
  v.literal('in_progress'),
  v.literal('completed'),
  v.literal('cancelled'),
);

export const listSurveys = query({
  args: { status: v.optional(surveyStatus), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const limit = args.limit ?? 50;
    const surveys = args.status
      ? await ctx.db
          .query('surveys')
          .withIndex('by_status', (q) => q.eq('status', args.status!))
          .order('desc')
          .take(limit)
      : await ctx.db.query('surveys').order('desc').take(limit);

    return Promise.all(
      surveys.map(async (s) => {
        const lead = await ctx.db.get(s.leadId);
        const engineer = await ctx.db.get(s.assignedEngineerId);
        return { ...s, lead, engineer };
      }),
    );
  },
});

export const getSurveyById = query({
  args: { surveyId: v.id('surveys') },
  handler: async (ctx, args) => {
    const survey = await ctx.db.get(args.surveyId);
    if (!survey) return null;
    const lead = await ctx.db.get(survey.leadId);
    const engineer = await ctx.db.get(survey.assignedEngineerId);
    return { ...survey, lead, engineer };
  },
});

export const scheduleSurvey = mutation({
  args: {
    leadId: v.id('leads'),
    scheduledAt: v.number(),
    assignedEngineerId: v.id('users'),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error('Lead not found');

    const now = Date.now();
    const surveyNumber = await generateDocumentNumber(ctx, 'SVY');

    const surveyId = await ctx.db.insert('surveys', {
      surveyNumber,
      leadId: args.leadId,
      status: 'scheduled',
      scheduledAt: args.scheduledAt,
      assignedEngineerId: args.assignedEngineerId,
      remarks: args.remarks,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.leadId, { status: 'survey_scheduled', updatedAt: now });
    await ctx.db.insert('leadActivities', {
      leadId: args.leadId,
      type: 'task',
      content: `Site survey scheduled (${surveyNumber})`,
      doneByUserId: user._id,
      createdAt: now,
    });

    await logAudit(ctx, {
      userId: user._id,
      action: 'create',
      entityType: 'surveys',
      entityId: surveyId as string,
    });

    return surveyId;
  },
});

export const completeSurvey = mutation({
  args: {
    surveyId: v.id('surveys'),
    rooftopAreaSqFt: v.optional(v.number()),
    recommendedCapacityKw: v.number(),
    panelCount: v.number(),
    structuralStrength: v.optional(v.union(v.literal('good'), v.literal('moderate'), v.literal('poor'))),
    shadowAnalysis: v.optional(v.string()),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateUser(ctx);
    const survey = await ctx.db.get(args.surveyId);
    if (!survey) throw new Error('Survey not found');

    const now = Date.now();
    await ctx.db.patch(args.surveyId, {
      status: 'completed',
      completedAt: now,
      rooftopAreaSqFt: args.rooftopAreaSqFt,
      recommendedCapacityKw: args.recommendedCapacityKw,
      panelCount: args.panelCount,
      structuralStrength: args.structuralStrength,
      shadowAnalysis: args.shadowAnalysis,
      remarks: args.remarks,
      updatedAt: now,
    });

    await ctx.db.patch(survey.leadId, {
      status: 'survey_completed',
      expectedCapacityKw: args.recommendedCapacityKw,
      updatedAt: now,
    });

    return { success: true };
  },
});
