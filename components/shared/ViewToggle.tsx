'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Kanban, LayoutList } from 'lucide-react';

export type ViewMode = 'table' | 'kanban';

type ViewToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
};

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-border/60 bg-muted/30 p-0.5', className)}>
      <Button
        type="button"
        variant={value === 'table' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5 px-3"
        onClick={() => onChange('table')}
      >
        <LayoutList className="size-3.5" />
        Table
      </Button>
      <Button
        type="button"
        variant={value === 'kanban' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 gap-1.5 px-3"
        onClick={() => onChange('kanban')}
      >
        <Kanban className="size-3.5" />
        Kanban
      </Button>
    </div>
  );
}
