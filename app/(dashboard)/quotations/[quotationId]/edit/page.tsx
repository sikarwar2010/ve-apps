import { QuotationEditForm } from '@/components/quotations/QuotationEditForm';
import type { Id } from '@/convex/_generated/dataModel';

type PageProps = {
  params: Promise<{ quotationId: string }>;
};

export default async function EditQuotationPage({ params }: PageProps) {
  const { quotationId } = await params;
  return <QuotationEditForm quotationId={quotationId as Id<'quotations'>} />;
}
