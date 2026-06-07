'use client';

import { KPICard } from '@/components/kpi/KPICard';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { formatCapacity, formatCurrencyCompact, formatRelative } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import {
  ArrowRightLeft,
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
  note:           { icon: FileText,       bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-500' },
  call:           { icon: Phone,          bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600' },
  whatsapp:       { icon: MessageCircle,  bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600' },
  email:          { icon: FileText,       bg: 'bg-blue-100 dark:bg-blue-900/40',   text: 'text-blue-600' },
  visit:          { icon: MapPin,         bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600' },
  status_change:  { icon: ArrowRightLeft, bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600' },
  follow_up_set:  { icon: FileText,       bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-500' },
  task:           { icon: FileText,       bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-500' },
} as const;

const PIPELINE_STAGE_COLORS = [
  { bar: 'bg-blue-500',   dot: 'bg-blue-500' },
  { bar: 'bg-purple-500', dot: 'bg-purple-500' },
  { bar: 'bg-amber-500',  dot: 'bg-amber-500' },
  { bar: 'bg-cyan-500',   dot: 'bg-cyan-500' },
  { bar: 'bg-orange-500', dot: 'bg-orange-500' },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-1" />
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

function LeadInitials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      {letters}
    </span>
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

  if (stats === undefined) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{greeting}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
          <p className="text-xs text-muted-foreground/70">Solar pipeline synced in real time</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild className="cursor-pointer">
            <Link href="/crm/leads">
              <Users className="mr-1.5 size-3.5" />
              View Leads
            </Link>
          </Button>
          <Button size="sm" asChild className="cursor-pointer">
            <Link href="/crm/leads/new">
              <Plus className="mr-1.5 size-3.5" />
              New Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* ── KPI grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KPICard
          label="Total Leads"
          value={String(stats.totalLeads)}
          icon={Users}
          accent="emerald"
          href="/crm/leads"
        />
        <KPICard
          label="Active Orders"
          value={String(stats.activeOrders)}
          icon={ShoppingCart}
          accent="blue"
          href="/orders"
        />
        <KPICard
          label="Revenue (MTD)"
          value={formatCurrencyCompact(stats.revenueMtd)}
          icon={IndianRupee}
          accent="amber"
          href="/finance/invoices"
        />
        <KPICard
          label="Won Deals"
          value={String(stats.wonCount)}
          subtext={`${stats.conversionRate}% conversion`}
          icon={Zap}
          accent="emerald"
          href="/crm/leads"
        />
      </div>

      {/* ── Pipeline + Recent leads ──────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Pipeline */}
        <Card className="overflow-hidden lg:col-span-1">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-sm font-semibold">Sales Pipeline</CardTitle>
              <Link href="/crm/leads" className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-brand">
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              {stats.pipeline.map((stage, index) => {
                const color = PIPELINE_STAGE_COLORS[index % PIPELINE_STAGE_COLORS.length];
                return (
                  <div key={stage.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('size-2 rounded-full', color.dot)} />
                        <span className="text-xs font-medium text-muted-foreground">{stage.stage}</span>
                      </div>
                      <span className="text-xs font-bold tabular-nums text-foreground">{stage.count}</span>
                    </div>
                    {/* Custom progress bar (avoids shadcn Progress PIPELINE_INDICATOR_CLASSES hack) */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', color.bar)}
                        style={{ width: `${stage.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conversion rate tile */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800/30 dark:bg-emerald-950/20">
              <div className="space-y-0.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Conversion Rate</p>
                <p className="font-heading text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {stats.conversionRate}%
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Zap className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent leads */}
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-sm font-semibold">Recent Leads</CardTitle>
              <Link href="/crm/leads/new" className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-brand">
                + New lead
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                  <Sun className="size-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">No leads yet</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Create your first lead to start tracking.</p>
                </div>
                <Button size="sm" asChild className="cursor-pointer mt-1">
                  <Link href="/crm/leads/new">
                    <Plus className="mr-1.5 size-3.5" />
                    Add Lead
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {stats.recentLeads.map((lead) => (
                  <Link
                    key={lead._id}
                    href={`/crm/leads/${lead._id}`}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted/40"
                  >
                    <LeadInitials name={lead.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{lead.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        {lead.city}
                        {lead.expectedCapacityKw ? (
                          <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">
                            · {formatCapacity(lead.expectedCapacityKw)}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
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

      {/* ── Activity feed ───────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-sm font-semibold">Recent Activity</CardTitle>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Real-time
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {stats.recentActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Activity will appear as your team works on leads.
            </p>
          ) : (
            <div className="grid gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.recentActivity.map((activity) => {
                const cfg = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] ?? ACTIVITY_ICONS.note;
                const ActivityIcon = cfg.icon;
                return (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors duration-150 hover:bg-muted/30"
                  >
                    <div className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
                      <ActivityIcon className={cn('size-3.5', cfg.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed text-foreground/90">
                        {activity.leadName ? (
                          <span className="font-semibold">{activity.leadName} — </span>
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
        </CardContent>
      </Card>
    </div>
  );
}
