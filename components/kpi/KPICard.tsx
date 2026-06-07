import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type KPICardProps = {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  href?: string;
};

export function KPICard({
  label,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  iconClassName,
  iconBgClassName,
  href,
}: KPICardProps) {
  const content = (
    <Card
      className={cn(
        'group relative overflow-hidden p-0 transition-all duration-200',
        href && 'cursor-pointer hover:border-brand/20 hover:shadow-md hover:shadow-brand/5',
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('rounded-xl p-2.5 ring-1 ring-border/50', iconBgClassName ?? 'bg-muted/60')}>
            <Icon className={cn('size-4', iconClassName ?? 'text-foreground')} />
          </div>
          <div className="flex items-center gap-1">
            {change ? (
              <span
                className={cn(
                  'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                  trend === 'up' && 'bg-brand-muted text-brand',
                  trend === 'down' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                  trend === 'neutral' && 'text-muted-foreground',
                )}
              >
                {trend === 'up' && <TrendingUp className="size-3" />}
                {trend === 'down' && <TrendingDown className="size-3" />}
                {change}
              </span>
            ) : null}
            {href ? (
              <ArrowUpRight className="size-3.5 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
            ) : null}
          </div>
        </div>
        <div className="mt-3">
          <p className="font-heading text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
