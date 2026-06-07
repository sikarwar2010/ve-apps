import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TONE_CLASSES } from '@/utils/constants';

type StatusBadgeProps = {
  status: string;
  config: Record<string, { label: string; tone: string }>;
  className?: string;
};

export function StatusBadge({ status, config, className }: StatusBadgeProps) {
  const item = config[status] ?? { label: status.replace(/_/g, ' '), tone: 'slate' };
  return (
    <Badge
      variant="outline"
      className={cn('border-transparent font-normal capitalize', TONE_CLASSES[item.tone], className)}
    >
      {item.label}
    </Badge>
  );
}
