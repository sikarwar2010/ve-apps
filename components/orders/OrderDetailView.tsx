'use client';

import PageHeader from '@/components/layout/Pageheader';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { StatusBadge } from '@/components/status/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { ORDER_STATUS } from '@/utils/constants';
import { formatCapacity, formatCurrency, formatDate } from '@/utils/formatters';
import { useMutation, useQuery } from 'convex/react';
import { Ban, ChevronDown, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function OrderDetailView({ orderId }: { orderId: Id<'salesOrders'> }) {
  const router = useRouter();
  const order = useQuery(api.modules.orders.getOrderById, { orderId });
  const updateOrder = useMutation(api.modules.orders.updateOrder);
  const cancelOrder = useMutation(api.modules.orders.cancelOrder);
  const deleteOrder = useMutation(api.modules.orders.deleteOrder);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [installDate, setInstallDate] = useState('');

  if (order === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!order) return <p className="py-16 text-center text-muted-foreground">Order not found</p>;

  const canCancel = order.status !== 'completed' && order.status !== 'cancelled';
  const canDelete = order.status === 'draft';
  const statusOptions = Object.keys(ORDER_STATUS).filter((s) => s !== order.status);

  async function handleStatusChange(status: string) {
    try {
      await updateOrder({
        orderId,
        status: status as
          | 'draft'
          | 'confirmed'
          | 'in_procurement'
          | 'ready_for_dispatch'
          | 'dispatched'
          | 'installation_pending'
          | 'installed'
          | 'net_meter_pending'
          | 'subsidy_pending'
          | 'completed'
          | 'cancelled',
      });
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleInstallDateSave() {
    if (!installDate) return;
    try {
      await updateOrder({ orderId, expectedInstallationDate: new Date(installDate).getTime() });
      toast.success('Installation date saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    try {
      await cancelOrder({ orderId });
      toast.success('Order cancelled');
      setCancelOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    setActionLoading(true);
    try {
      await deleteOrder({ orderId });
      toast.success('Order deleted');
      router.push('/orders');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`${order.customer?.name ?? 'Customer'} · Confirmed ${formatDate(order.orderDate)}`}
        breadcrumbs={[{ label: 'Sales Orders', href: '/orders' }, { label: order.orderNumber }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.status} config={ORDER_STATUS} />
            {order.quotationId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/quotations/${order.quotationId}`}>View quotation</Link>
              </Button>
            ) : null}
            {order.leadId ? (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/crm/leads/${order.leadId}`}>View lead</Link>
              </Button>
            ) : null}
            {canCancel ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update status
                      <ChevronDown className="ml-1 size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {statusOptions.map((status) => (
                      <DropdownMenuItem key={status} onClick={() => void handleStatusChange(status)}>
                        {ORDER_STATUS[status]?.label ?? status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
                  <Ban className="mr-1.5 size-4" />
                  Cancel
                </Button>
              </>
            ) : null}
            {canDelete ? (
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-1.5 size-4" />
                Delete
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="font-semibold">{order.customer?.name}</p>
              <p className="text-muted-foreground">{order.customer?.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">From quotation</p>
              <p className="font-mono text-sm">{order.quotation?.quotationNumber ?? '—'}</p>
              {order.quotation ? (
                <p className="text-muted-foreground">{formatCapacity(order.quotation.systemCapacityKw)}</p>
              ) : null}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gross order value</p>
              <p className="text-lg font-bold">{formatCurrency(order.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Net payable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subsidy (est.)</span>
              <span className="text-emerald-600">− {formatCurrency(order.subsidyAmountEstimated)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Customer pays</span>
              <span>{formatCurrency(order.netAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {canCancel ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Update order</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="installDate">Expected installation date</Label>
              <Input
                id="installDate"
                type="date"
                className="w-auto"
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => void handleInstallDateSave()} disabled={!installDate}>
              Save date
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payment milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {order.paymentSchedule.map((m) => (
              <div
                key={m.milestone}
                className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{m.milestone}</p>
                  <p className="text-xs text-muted-foreground">{m.duePct}% of net</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(m.dueAmount)}</p>
                  <StatusBadge
                    status={m.status}
                    config={{
                      pending: { label: 'Pending', tone: 'amber' },
                      partial: { label: 'Partial', tone: 'blue' },
                      paid: { label: 'Paid', tone: 'green' },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel order?"
        description="Order will be marked cancelled."
        confirmLabel="Cancel order"
        loading={actionLoading}
        onConfirm={handleCancel}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete order?"
        description="Draft order will be permanently removed."
        loading={actionLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
