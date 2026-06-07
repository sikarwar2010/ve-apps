import { QuotationDetailView } from '@/components/quotations/QuotationDetailView';
import type { Id } from '@/convex/_generated/dataModel';

type PageProps = { params: Promise<{ quotationId: string }> };

export default async function QuotationDetailPage({ params }: PageProps) {
  const { quotationId } = await params;
  return <QuotationDetailView quotationId={quotationId as Id<'quotations'>} />;
}
