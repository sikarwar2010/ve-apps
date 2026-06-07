import { CustomerForm } from '@/components/customers/CustomerForm';
import type { Id } from '@/convex/_generated/dataModel';

type PageProps = {
  params: Promise<{ customerId: string }>;
};

export default async function EditCustomerPage({ params }: PageProps) {
  const { customerId } = await params;
  return <CustomerForm customerId={customerId as Id<'customers'>} />;
}
