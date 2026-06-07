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
import { Ban, ChevronDown, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const MILESTONE_STATUS_CONFIG = {
  pending: { label: 'Pending', tone: 'amber' },
  partial: { label: 'Partial', tone: 'blue' },
  paid:    { label: 'Paid',    tone: 'green' },
} as const;

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
          | 'draft' | 'confirmed' | 'in_procurement' | 'ready_for_dispatch' | 'dispatched'
          | 'installation_pending' | 'installed' | 'net_meter_pending' | 'subsidy_pending'
          | 'completed' | 'cancelled',
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

  const paidMilestones = order.paymentSchedule.filter((m) => m.status === 'paid').length;
  const totalMilestones = order.paymentSchedule.length;
  const progressPct = totalMilestones > 0 ? Math.round((paidMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`${order.customer?.name ?? 'Customer'} · Confirmed ${formatDate(order.orderDate)}`}
        breadcrumbs={[{ label: 'Sales Orders', href: '/orders' }, { label: order.orderNumber }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} config={ORDER_STATUS} />
            {order.quotationId && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/quotations/${order.quotationId}`}>View Quotation</Link>
              </Button>
            )}
            {order.leadId && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/crm/leads/${order.leadId}`}>View Lead</Link>
              </Button>
            )}
            {canCancel && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update Status
                      <ChevronDown className="ml-1 size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
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
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        }
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Customer</p>
          <p className="mt-1 text-sm font-bold leading-tight">{order.customer?.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{order.customer?.mobile}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">System Capacity</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-amber-600">
            {order.quotation ? formatCapacity(order.quotation.systemCapacityKw) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Gross Value</p>
          <p className="mt-1 text-lg font-bold tabular-nums">{formatCurrency(order.totalAmount)}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
          <p className="text-xs text-muted-foreground">Customer Pays</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatCurrency(order.netAmount)}
          </p>
          <p className="text-[11px] text-muted-foreground">−{formatCurrency(order.subsidyAmountEstimated)} subsidy</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Payment milestones */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Payment Milestones</CardTitle>
              <span className="text-xs text-muted-foreground">{paidMilestones}/{totalMilestones} paid</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.paymentSchedule.map((m, i) => (
              <div
                key={m.milestone}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                  m.status === 'paid'
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20'
                    : 'border-border/50 bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                    m.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                  }`}>
                    {m.status === 'paid' ? <CheckCircle2 className="size-4" /> : <Clock className="size-3.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.milestone}</p>
                    <p className="text-xs text-muted-foreground">{m.duePct}% of net amount</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(m.dueAmount)}</p>
                  <StatusBadge status={m.status} config={MILESTONE_STATUS_CONFIG} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {order.quotationId && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Linked Quotation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-mono font-medium">{order.quotation?.quotationNumber ?? '—'}</p>
                {order.quotation && (
                  <p className="text-muted-foreground">{formatCapacity(order.quotation.systemCapacityKw)}</p>
                )}
                <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                  <Link href={`/quotations/${order.quotationId}`}>View Quotation</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {canCancel && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Installation Date</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="installDate" className="text-xs">Expected Date</Label>
                  <Input
                    id="installDate"
                    type="date"
                    className="h-8 text-sm"
                    value={installDate}
                    onChange={(e) => setInstallDate(e.target.value)}
                  />
                </div>
                <Button size="sm" className="w-full" onClick={() => void handleInstallDateSave()} disabled={!installDate}>
                  Save Date
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
