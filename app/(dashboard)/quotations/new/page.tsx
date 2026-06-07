import { QuotationBuilder } from '@/components/quotations/QuotationBuilder';
import { Suspense } from 'react';

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>}>
      <QuotationBuilder />
    </Suspense>
  );
}
