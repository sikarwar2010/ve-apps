'use client';

import { KPICard } from '@/components/kpi/KPICard';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
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
  Plus,
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

const PIPELINE_INDICATOR_CLASSES = [
  '[&_[data-slot=progress-indicator]]:bg-brand',
  '[&_[data-slot=progress-indicator]]:bg-chart-2',
  '[&_[data-slot=progress-indicator]]:bg-solar',
  '[&_[data-slot=progress-indicator]]:bg-chart-4',
  '[&_[data-slot=progress-indicator]]:bg-chart-5',
] as const;

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-1" />
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const stats = useQuery(api.modules.dashboard.getDashboardStats, {});
  const seedWelcome = useMutation(api.modules.notifications.seedWelcomeNotification);

  useEffect(() => {
    void seedWelcome({});
  }, [seedWelcome]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (stats === undefined) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{greeting}</h1>
            <Badge variant="secondary" className="hidden border-brand/20 bg-brand-muted text-brand sm:inline-flex">
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-brand" />
              Live
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
          <p className="text-sm text-muted-foreground/80">Your solar pipeline at a glance — synced in real time.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild className="cursor-pointer">
            <Link href="/crm/leads">
              <Users className="size-3.5" />
              View leads
            </Link>
          </Button>
          <Button size="sm" asChild className="cursor-pointer bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/crm/leads/new">
              <Plus className="size-3.5" />
              New lead
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPICard
          label="Total Leads"
          value={String(stats.totalLeads)}
          icon={Users}
          iconClassName="text-brand"
          iconBgClassName="bg-brand-muted"
          href="/crm/leads"
        />
        <KPICard
          label="Active Orders"
          value={String(stats.activeOrders)}
          icon={ShoppingCart}
          iconClassName="text-chart-4"
          iconBgClassName="bg-chart-4/10"
          href="/orders"
        />
        <KPICard
          label="Revenue (MTD)"
          value={formatCurrencyCompact(stats.revenueMtd)}
          icon={IndianRupee}
          iconClassName="text-brand"
          iconBgClassName="bg-brand-muted"
          href="/finance/invoices"
        />
        <KPICard
          label="Won Deals"
          value={String(stats.wonCount)}
          icon={Zap}
          iconClassName="text-solar-foreground"
          iconBgClassName="bg-solar-muted"
          href="/crm/leads"
        />
      </div>

      {/* Pipeline + Recent leads */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-1">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-sm font-semibold">Sales Pipeline</CardTitle>
              <Link
                href="/crm/leads"
                className="cursor-pointer text-xs text-muted-foreground transition-colors duration-200 hover:text-brand"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {stats.pipeline.map((stage, index) => (
                <div key={stage.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{stage.stage}</span>
                    <span className="text-xs font-semibold tabular-nums">{stage.count}</span>
                  </div>
                  <Progress
                    value={stage.percent}
                    className={cn(
                      'h-2 bg-muted/60',
                      PIPELINE_INDICATOR_CLASSES[index % PIPELINE_INDICATOR_CLASSES.length],
                    )}
                  />
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between rounded-xl border border-brand/15 bg-brand-muted/50 px-3 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-brand/10">
                  <BarChart3 className="size-3.5 text-brand" />
                </div>
                <span className="text-xs font-medium">Conversion Rate</span>
              </div>
              <span className="font-heading text-sm font-bold text-brand tabular-nums">{stats.conversionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-sm font-semibold">Recent Leads</CardTitle>
              <Link
                href="/crm/leads/new"
                className="cursor-pointer text-xs text-muted-foreground transition-colors duration-200 hover:text-brand"
              >
                + New lead
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            {stats.recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-muted">
                  <Sun className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium">No leads yet</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Create your first lead to start tracking.</p>
                </div>
                <Button size="sm" asChild className="cursor-pointer bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link href="/crm/leads/new">
                    <Plus className="size-3.5" />
                    Add lead
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {stats.recentLeads.map((lead) => (
                  <Link
                    key={lead._id}
                    href={`/crm/leads/${lead._id}`}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-muted/40"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-muted to-muted font-heading text-xs font-semibold text-brand">
                      {lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{lead.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
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
          </CardContent>
        </Card>
      </div>

      {/* Activity feed */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-sm font-semibold">Recent Activity</CardTitle>
            <Badge variant="secondary" className="border-brand/20 bg-brand-muted text-[10px] text-brand">
              Real-time
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {stats.recentActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Activity will appear as your team works leads.
            </p>
          ) : (
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {stats.recentActivity.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] ?? FileText;
                return (
                  <div
                    key={activity._id}
                    className="flex cursor-default items-start gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-muted/30"
                  >
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed text-foreground/90">
                        {activity.leadName ? (
                          <>
                            <span className="font-semibold">{activity.leadName}</span>
                            {' — '}
                          </>
                        ) : null}
                        {activity.content}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{formatRelative(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
