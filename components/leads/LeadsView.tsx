'use client';

import { LeadKanban } from '@/components/leads/LeadKanban';
import { LeadTable } from '@/components/leads/LeadTable';
import { ViewToggle, type ViewMode } from '@/components/shared/ViewToggle';
import { useState } from 'react';

export function LeadsView() {
  const [view, setView] = useState<ViewMode>('table');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewToggle value={view} onChange={setView} />
      </div>
      {view === 'table' ? <LeadTable /> : <LeadKanban />}
    </div>
  );
}
