'use client';

import { NotificationCenter } from '@/components/layout/NotificationCenter';
import { ModeToggle } from '@/components/providers/modetoggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/usePermissions';
import { getRoleLabel } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { UserButton, useUser } from '@clerk/nextjs';
import { ChevronRight, Home, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ROUTE_LABELS: Record<string, string> = {
  crm: 'CRM',
  leads: 'Leads',
  lead: 'Leads',
  customers: 'Customers',
  survey: 'Site Survey',
  quotations: 'Quotations',
  orders: 'Sales Orders',
  procurement: 'Procurement',
  requisitions: 'Requisitions',
  rfq: 'RFQ',
  'purchase-orders': 'Purchase Orders',
  grn: 'GRN',
  inventory: 'Inventory',
  movements: 'Movements',
  'stock-transfer': 'Transfers',
  dispatch: 'Dispatch',
  installation: 'Installation',
  'net-meter': 'Net Meter',
  subsidy: 'PM Surya Subsidy',
  finance: 'Finance',
  invoices: 'Invoices',
  payments: 'Payments',
  ledger: 'Ledger',
  service: 'After-Sales',
  tickets: 'Service Tickets',
  warranty: 'Warranty',
  reports: 'Reports',
  documents: 'Documents',
  'audit-logs': 'Audit Logs',
  settings: 'Settings',
};

function toLabel(seg: string) {
  return ROUTE_LABELS[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TopNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { role } = usePermissions();

  const displayName = user?.fullName ?? user?.firstName ?? 'Account';
  const email = user?.primaryEmailAddress?.emailAddress;
  const roleLabel = getRoleLabel(role);

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: toLabel(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  const pageTitle = breadcrumbs.at(-1)?.label ?? 'Dashboard';

  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 bg-background/95 px-3 backdrop-blur-xl md:px-5">
      <div className="flex items-center gap-1 md:gap-0">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <span className="text-xs font-medium text-muted-foreground md:hidden">Menu</span>
      </div>

      <Separator orientation="vertical" className="mr-1 hidden h-5 opacity-40 sm:block" />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <p className="truncate text-sm font-semibold tracking-tight sm:hidden">{pageTitle}</p>
        <div className="hidden min-w-0 flex-1 flex-col justify-center sm:flex">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">{pageTitle}</p>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-0.5 text-xs text-muted-foreground">
            <Link
              href="/"
              className="flex shrink-0 items-center rounded-sm p-0.5 transition-colors hover:text-foreground"
              aria-label="Dashboard home"
            >
              <Home className="size-3" />
            </Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.href} className="flex min-w-0 items-center gap-0.5">
                <ChevronRight className="size-3 shrink-0 opacity-40" />
                {crumb.isLast ? (
                  <span className="truncate font-medium text-muted-foreground">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="truncate transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            type="search"
            placeholder="Search leads, customers, orders…"
            className="h-9 w-56 border-border/50 bg-muted/35 pl-9 text-sm shadow-none transition-[width,box-shadow] duration-200 focus-visible:w-72 focus-visible:bg-background focus-visible:ring-1 xl:w-64 xl:focus-visible:w-80"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70 xl:inline">
            ⌘K
          </kbd>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        <NotificationCenter />

        <ModeToggle />

        <Separator orientation="vertical" className="mx-1 hidden h-5 opacity-40 sm:block" />

        <div
          className={cn(
            'flex max-w-55 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 py-0.5 pr-2.5 pl-0.5',
            'transition-colors hover:bg-muted/50',
          )}
        >
          <UserButton />
          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-xs font-semibold leading-tight text-foreground">{displayName}</span>
            <span className="truncate text-[10px] leading-tight text-muted-foreground">
              {roleLabel !== 'Guest' ? roleLabel : (email ?? 'Signed in')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
