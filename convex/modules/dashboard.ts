import { query } from '../_generated/server';

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const leads = await ctx.db.query('leads').collect();
    const orders = await ctx.db.query('salesOrders').collect();

    const statusCounts = {
      new: 0,
      contacted: 0,
      interested: 0,
      survey_scheduled: 0,
      survey_completed: 0,
      quotation_sent: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    };

    for (const lead of leads) {
      statusCounts[lead.status] += 1;
    }

    const activeOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'completed').length;
    const revenueMtd = orders
      .filter((o) => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return o.createdAt >= monthStart.getTime() && o.status !== 'cancelled';
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pipeline = [
      { stage: 'New Leads', count: statusCounts.new, key: 'new' },
      { stage: 'Contacted', count: statusCounts.contacted, key: 'contacted' },
      { stage: 'Survey Scheduled', count: statusCounts.survey_scheduled, key: 'survey_scheduled' },
      { stage: 'Quotation Sent', count: statusCounts.quotation_sent, key: 'quotation_sent' },
      { stage: 'Negotiation', count: statusCounts.negotiation, key: 'negotiation' },
    ];

    const maxPipeline = Math.max(...pipeline.map((p) => p.count), 1);
    const pipelineWithPct = pipeline.map((p) => ({
      ...p,
      percent: Math.round((p.count / maxPipeline) * 100),
    }));

    const recentLeads = [...leads]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((lead) => ({
        _id: lead._id,
        name: lead.name,
        city: lead.city,
        status: lead.status,
        expectedCapacityKw: lead.expectedCapacityKw,
        createdAt: lead.createdAt,
      }));

    const activitiesRaw = (await ctx.db.query('leadActivities').collect())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 8);
    const recentActivity = await Promise.all(
      activitiesRaw.map(async (activity) => {
        const lead = await ctx.db.get(activity.leadId);
        return {
          _id: activity._id,
          type: activity.type,
          content: activity.content,
          createdAt: activity.createdAt,
          leadName: lead?.name,
          leadNumber: lead?.leadNumber,
        };
      }),
    );

    const wonCount = statusCounts.won;
    const conversionRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 1000) / 10 : 0;

    return {
      totalLeads: leads.length,
      activeOrders,
      revenueMtd,
      wonCount,
      conversionRate,
      pipeline: pipelineWithPct,
      recentLeads,
      recentActivity,
    };
  },
});
