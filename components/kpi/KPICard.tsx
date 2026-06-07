import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
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
    <Card className={cn('p-4 transition-shadow', href && 'group cursor-pointer hover:shadow-md')}>
      <div className="flex items-start justify-between gap-3">
        <div className={cn('rounded-xl p-2.5', iconBgClassName ?? 'bg-muted/60')}>
          <Icon className={cn('size-4', iconClassName ?? 'text-foreground')} />
        </div>
        {change ? (
          <span
            className={cn(
              'flex items-center gap-0.5 text-[11px] font-medium',
              trend === 'up' && 'text-emerald-600 dark:text-emerald-400',
              trend === 'down' && 'text-red-600 dark:text-red-400',
              trend === 'neutral' && 'text-muted-foreground',
            )}
          >
            {trend === 'up' && <TrendingUp className="size-3" />}
            {trend === 'down' && <TrendingDown className="size-3" />}
            {change}
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
