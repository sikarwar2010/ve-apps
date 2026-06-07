import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export type KPIAccent = 'emerald' | 'amber' | 'blue' | 'violet' | 'rose' | 'cyan';

const ACCENT_MAP: Record<KPIAccent, {
  border: string;
  iconBg: string;
  iconText: string;
  glow: string;
  trendUp: string;
  badge: string;
}> = {
  emerald: {
    border:   'border-t-emerald-500',
    iconBg:   'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    glow:     'hover:shadow-emerald-500/10',
    trendUp:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    badge:    'bg-emerald-500',
  },
  amber: {
    border:   'border-t-amber-500',
    iconBg:   'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    glow:     'hover:shadow-amber-500/10',
    trendUp:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    badge:    'bg-amber-500',
  },
  blue: {
    border:   'border-t-blue-500',
    iconBg:   'bg-blue-100 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    glow:     'hover:shadow-blue-500/10',
    trendUp:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    badge:    'bg-blue-500',
  },
  violet: {
    border:   'border-t-violet-500',
    iconBg:   'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
    glow:     'hover:shadow-violet-500/10',
    trendUp:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    badge:    'bg-violet-500',
  },
  rose: {
    border:   'border-t-rose-500',
    iconBg:   'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    glow:     'hover:shadow-rose-500/10',
    trendUp:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    badge:    'bg-rose-500',
  },
  cyan: {
    border:   'border-t-cyan-500',
    iconBg:   'bg-cyan-100 dark:bg-cyan-900/40',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    glow:     'hover:shadow-cyan-500/10',
    trendUp:  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    badge:    'bg-cyan-500',
  },
};

type KPICardProps = {
  label: string;
  value: string;
  subtext?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  accent?: KPIAccent;
  /** @deprecated use accent instead */
  iconClassName?: string;
  /** @deprecated use accent instead */
  iconBgClassName?: string;
  href?: string;
};

export function KPICard({
  label,
  value,
  subtext,
  change,
  trend = 'neutral',
  icon: Icon,
  accent = 'emerald',
  href,
}: KPICardProps) {
  const a = ACCENT_MAP[accent];

  const card = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border-t-[3px] border border-border/60 bg-card p-5 shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        a.border,
        a.glow,
        href && 'cursor-pointer',
      )}
    >
      {/* Decorative radial glow behind icon */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-4 -top-4 size-24 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-30',
          a.iconBg,
        )}
      />

      <div className="flex items-start justify-between gap-4">
        {/* Left: label + value */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-heading text-3xl font-bold tabular-nums leading-none tracking-tight text-foreground sm:text-4xl">
            {value}
          </p>

          {/* Trend + change */}
          {(change || subtext) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {change && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    trend === 'up'   && a.trendUp,
                    trend === 'down' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    trend === 'neutral' && 'bg-muted text-muted-foreground',
                  )}
                >
                  {trend === 'up'   && <TrendingUp   className="size-3" />}
                  {trend === 'down' && <TrendingDown className="size-3" />}
                  {change}
                </span>
              )}
              {subtext && (
                <span className="text-[11px] text-muted-foreground">{subtext}</span>
              )}
            </div>
          )}
        </div>

        {/* Right: icon */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className={cn('flex size-11 items-center justify-center rounded-2xl', a.iconBg)}>
            <Icon className={cn('size-5', a.iconText)} />
          </div>
          {href && (
            <ArrowRight className="size-3.5 text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/70" />
          )}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href} className="block">{card}</Link> : card;
}
