import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  IndianRupee,
  Loader2,
  MapPin,
  ShoppingCart,
  Sun,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const KPI_CARDS = [
  {
    label: 'Total Leads',
    value: '1,284',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    href: '/crm/lead',
  },
  {
    label: 'Active Orders',
    value: '342',
    change: '+8%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    href: '/orders',
  },
  {
    label: 'Revenue (MTD)',
    value: '₹48.2L',
    change: '+23%',
    trend: 'up',
    icon: IndianRupee,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    href: '/finance/invoices',
  },
  {
    label: 'Installations',
    value: '96',
    change: '+5%',
    trend: 'up',
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    href: '/installation',
  },
];

const PIPELINE = [
  { stage: 'Site Survey', count: 48, total: 100, color: 'bg-blue-500' },
  { stage: 'Quotation Sent', count: 73, total: 100, color: 'bg-violet-500' },
  { stage: 'Order Confirmed', count: 61, total: 100, color: 'bg-amber-500' },
  { stage: 'Installation', count: 34, total: 100, color: 'bg-emerald-500' },
  { stage: 'Subsidy Applied', count: 22, total: 100, color: 'bg-orange-500' },
];

const RECENT_LEADS = [
  { name: 'Rajesh Kumar', location: 'Jaipur', capacity: '5 kW', status: 'New', time: '10m ago' },
  { name: 'Priya Sharma', location: 'Ahmedabad', capacity: '3 kW', status: 'Contacted', time: '42m ago' },
  { name: 'Anil Verma', location: 'Surat', capacity: '10 kW', status: 'Survey Scheduled', time: '2h ago' },
  { name: 'Meena Patel', location: 'Vadodara', capacity: '7 kW', status: 'Quoted', time: '3h ago' },
  { name: 'Suresh Nair', location: 'Pune', capacity: '4 kW', status: 'New', time: '5h ago' },
];

const RECENT_ACTIVITY = [
  { icon: CheckCircle2, color: 'text-emerald-500', text: 'Installation completed — Vikas Mehta, Indore', time: '5m ago' },
  { icon: FileText, color: 'text-blue-500', text: 'Quotation sent to Anjali Singh, Bhopal', time: '22m ago' },
  { icon: MapPin, color: 'text-violet-500', text: 'Site survey scheduled — Deepak Joshi, Nagpur', time: '1h ago' },
  { icon: IndianRupee, color: 'text-emerald-500', text: 'Payment received ₹1.8L from Sharma Household', time: '2h ago' },
  { icon: Clock, color: 'text-amber-500', text: 'GRN pending approval — PO #4821', time: '3h ago' },
  { icon: Loader2, color: 'text-blue-500', text: 'Subsidy application submitted — 3 customers', time: '4h ago' },
];

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  Contacted: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
  'Survey Scheduled': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  Quoted: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
};

export default function DashboardPage() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting} 👋</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your solar pipeline today.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-amber-200/60 bg-amber-50/60 px-3 py-2 dark:border-amber-800/30 dark:bg-amber-950/20 sm:flex">
          <Sun className="size-4 text-amber-500" />
          <span className="text-[13px] font-medium text-amber-700 dark:text-amber-400">SuryaERP</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className="group cursor-pointer p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2 ${kpi.bg}`}>
                  <kpi.icon className={`size-4 ${kpi.color}`} />
                </div>
                <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-3" />
                  {kpi.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{kpi.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pipeline */}
        <Card className="p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Sales Pipeline</h2>
            <Link
              href="/orders"
              className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3.5">
            {PIPELINE.map((stage) => (
              <div key={stage.stage}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">{stage.stage}</span>
                  <span className="text-[12px] font-medium">{stage.count}</span>
                </div>
                <Progress value={stage.count} className="h-1.5" />
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-3.5 text-amber-500" />
              <span className="text-[12px] font-medium">Conversion Rate</span>
            </div>
            <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">34.2%</span>
          </div>
        </Card>

        {/* Recent Leads */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Recent Leads</h2>
            <Link
              href="/crm/lead"
              className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {RECENT_LEADS.map((lead, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-[11px] font-semibold text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
                  {lead.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{lead.name}</p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-2.5" />
                    {lead.location} · {lead.capacity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[lead.status] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {lead.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{lead.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold">Recent Activity</h2>
          <Badge variant="secondary" className="text-[10px]">
            Today
          </Badge>
        </div>
        <div className="grid gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
          {RECENT_ACTIVITY.map((activity, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-muted/30">
              <activity.icon className={`mt-px size-3.5 shrink-0 ${activity.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] leading-snug text-foreground/80">{activity.text}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
