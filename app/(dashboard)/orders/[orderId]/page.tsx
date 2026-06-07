import { OrderDetailView } from '@/components/shared/EntityDetailViews';
import type { Id } from '@/convex/_generated/dataModel';

type PageProps = { params: Promise<{ orderId: string }> };

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  return <OrderDetailView orderId={orderId as Id<'salesOrders'>} />;
}
