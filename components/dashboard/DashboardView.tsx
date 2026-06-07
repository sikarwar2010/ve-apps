'use client';

import { KPICard } from '@/components/kpi/KPICard';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { formatCapacity, formatCurrencyCompact, formatRelative } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import {
  ArrowRightLeft,
  BarChart3,
  FileText,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingCart,
  Sun,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

const ACTIVITY_ICONS = {
  note: FileText,
  call: Phone,
  whatsapp: MessageCircle,
  email: FileText,
  visit: MapPin,
  status_change: ArrowRightLeft,
  follow_up_set: FileText,
  task: FileText,
} as const;

export function DashboardView() {
  const stats = useQuery(api.modules.dashboard.getDashboardStats, {});
  const seedWelcome = useMutation(api.modules.notifications.seedWelcomeNotification);

  useEffect(() => {
    void seedWelcome({});
  }, [seedWelcome]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (stats === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Live pipeline from your Convex database — updated in real time.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2 dark:border-amber-800/30 dark:bg-amber-950/20 sm:flex">
          <Sun className="size-4 text-amber-500" />
          <span className="text-[13px] font-medium text-amber-700 dark:text-amber-400">SuryaERP</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          label="Total Leads"
          value={String(stats.totalLeads)}
          icon={Users}
          iconClassName="text-blue-600 dark:text-blue-400"
          iconBgClassName="bg-blue-50 dark:bg-blue-950/30"
          href="/crm/leads"
        />
        <KPICard
          label="Active Orders"
          value={String(stats.activeOrders)}
          icon={ShoppingCart}
          iconClassName="text-violet-600 dark:text-violet-400"
          iconBgClassName="bg-violet-50 dark:bg-violet-950/30"
          href="/orders"
        />
        <KPICard
          label="Revenue (MTD)"
          value={formatCurrencyCompact(stats.revenueMtd)}
          icon={IndianRupee}
          iconClassName="text-emerald-600 dark:text-emerald-400"
          iconBgClassName="bg-emerald-50 dark:bg-emerald-950/30"
          href="/finance/invoices"
        />
        <KPICard
          label="Won Deals"
          value={String(stats.wonCount)}
          icon={Zap}
          iconClassName="text-amber-600 dark:text-amber-400"
          iconBgClassName="bg-amber-50 dark:bg-amber-950/30"
          href="/crm/leads"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Sales Pipeline</h2>
            <Link href="/crm/leads" className="text-[11px] text-muted-foreground hover:text-foreground">
              View leads
            </Link>
          </div>
          <div className="space-y-3.5">
            {stats.pipeline.map((stage) => (
              <div key={stage.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">{stage.stage}</span>
                  <span className="text-[12px] font-medium">{stage.count}</span>
                </div>
                <Progress value={stage.percent} className="h-1.5" />
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-3.5 text-amber-500" />
              <span className="text-[12px] font-medium">Conversion Rate</span>
            </div>
            <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.conversionRate}%
            </span>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Recent Leads</h2>
            <Link href="/crm/leads/new" className="text-[11px] text-muted-foreground hover:text-foreground">
              + New lead
            </Link>
          </div>
          {stats.recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No leads yet. Create your first lead.</p>
          ) : (
            <div className="space-y-1">
              {stats.recentLeads.map((lead) => (
                <Link
                  key={lead._id}
                  href={`/crm/leads/${lead._id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-100 to-slate-200 text-[11px] font-semibold text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
                    {lead.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{lead.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="size-2.5" />
                      {lead.city}
                      {lead.expectedCapacityKw ? ` · ${formatCapacity(lead.expectedCapacityKw)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <LeadStatusBadge status={lead.status} />
                    <span className="text-[10px] text-muted-foreground">{formatRelative(lead.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold">Recent Activity</h2>
          <Badge variant="secondary" className="text-[10px]">
            Live
          </Badge>
        </div>
        {stats.recentActivity.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Activity will appear as your team works leads.
          </p>
        ) : (
          <div className="grid gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentActivity.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] ?? FileText;
              return (
                <div
                  key={activity._id}
                  className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-muted/30"
                >
                  <Icon className="mt-px size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] leading-snug text-foreground/80">
                      {activity.leadName ? (
                        <>
                          <span className="font-medium">{activity.leadName}</span>
                          {' — '}
                        </>
                      ) : null}
                      {activity.content}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{formatRelative(activity.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
