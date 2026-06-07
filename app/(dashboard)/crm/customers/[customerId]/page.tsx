import { CustomerDetailView } from '@/components/customers/CustomerDetailView';
import type { Id } from '@/convex/_generated/dataModel';

type PageProps = { params: Promise<{ customerId: string }> };

export default async function CustomerDetailPage({ params }: PageProps) {
  const { customerId } = await params;
  return <CustomerDetailView customerId={customerId as Id<'customers'>} />;
}
