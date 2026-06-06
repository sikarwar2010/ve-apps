'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/usePermissions';
import { getRoleLabel } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useUser } from '@clerk/nextjs';
import {
  BarChart3,
  Calculator,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderOpen,
  Gauge,
  Headphones,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  Package,
  PanelLeft,
  Settings,
  ShoppingCart,
  Sun,
  Truck,
  UserCircle,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_STRUCTURE = [
  {
    items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard, permission: null }],
  },
  {
    section: 'CRM',
    items: [
      { label: 'Leads', href: '/crm/lead', icon: Users, permission: 'leads:view' as const, badge: 'live' },
      { label: 'Customers', href: '/crm/customers', icon: UserCircle, permission: 'customers:view' as const },
    ],
  },
  {
    section: 'Pre-Sales',
    items: [
      { label: 'Site Survey', href: '/survey', icon: MapPin, permission: 'surveys:view' as const },
      { label: 'Quotations', href: '/quotations', icon: FileText, permission: 'quotations:view' as const },
      { label: 'Sales Orders', href: '/orders', icon: ShoppingCart, permission: 'orders:view' as const },
    ],
  },
  {
    section: 'Supply Chain',
    items: [
      {
        label: 'Procurement',
        icon: Package,
        permission: 'purchase:view' as const,
        children: [
          { label: 'Requisitions', href: '/procurement/requisitions' },
          { label: 'RFQ', href: '/procurement/rfq' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
          { label: 'GRN', href: '/procurement/grn' },
        ],
      },
      {
        label: 'Inventory',
        icon: Warehouse,
        permission: 'inventory:view' as const,
        children: [
          { label: 'Stock', href: '/inventory' },
          { label: 'Movements', href: '/inventory/movements' },
          { label: 'Transfers', href: '/inventory/stock-transfer' },
        ],
      },
      { label: 'Dispatch', href: '/dispatch', icon: Truck, permission: 'dispatch:view' as const },
    ],
  },
  {
    section: 'Execution',
    items: [
      { label: 'Installation', href: '/installation', icon: Wrench, permission: 'installation:view' as const },
      { label: 'Net Meter', href: '/net-meter', icon: Gauge, permission: 'orders:view' as const },
    ],
  },
  {
    section: 'Compliance',
    items: [
      {
        label: 'PM Surya Subsidy',
        href: '/subsidy',
        icon: IndianRupee,
        permission: 'subsidy:view' as const,
        badge: 'live',
      },
    ],
  },
  {
    section: 'Finance',
    items: [
      {
        label: 'Accounts',
        icon: Calculator,
        permission: 'finance:view_invoices' as const,
        children: [
          { label: 'Invoices', href: '/finance/invoices' },
          { label: 'Payments', href: '/finance/payments' },
          { label: 'Ledger', href: '/finance/ledger' },
        ],
      },
    ],
  },
  {
    section: 'After-Sales',
    items: [
      { label: 'Service Tickets', href: '/service/tickets', icon: Headphones, permission: 'service:view' as const },
      { label: 'Warranty', href: '/service/warranty', icon: Headphones, permission: 'service:view' as const },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Reports', href: '/reports', icon: BarChart3, permission: 'finance:view_reports' as const },
      { label: 'Documents', href: '/documents', icon: FolderOpen, permission: null },
      { label: 'Audit Logs', href: '/audit-logs', icon: ClipboardList, permission: 'settings:view' as const },
      { label: 'Settings', href: '/settings', icon: Settings, permission: 'settings:view' as const },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const { hasPermission, role } = usePermissions();
  const { user } = useUser();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Procurement', 'Inventory', 'Accounts']);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  };

  return (
    <aside
      className={cn(
        'relative z-30 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out',
        isCollapsed ? 'w-17' : 'w-64',
      )}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/20">
          <Sun className="size-4" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">SuryaERP</p>
            <p className="truncate text-[11px] text-muted-foreground">PM Surya Ghar</p>
          </div>
        )}
        {!isCollapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="ml-auto shrink-0 text-muted-foreground"
            onClick={toggleCollapse}
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="size-3.5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {NAV_STRUCTURE.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.section && !isCollapsed && (
              <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.section}
              </p>
            )}
            {group.items.map((item) => {
              if (item.permission && !hasPermission(item.permission)) return null;

              // Has children (expandable)
              if ('children' in item && item.children) {
                const isExpanded = expandedItems.includes(item.label);
                const isChildActive = item.children.some((c) => pathname.startsWith(c.href));

                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.label)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        isChildActive
                          ? 'bg-sidebar-accent font-medium text-amber-700 dark:text-amber-400'
                          : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                        </>
                      )}
                    </button>
                    {isExpanded && !isCollapsed && (
                      <div className="mt-0.5 ml-3 space-y-0.5 border-l border-sidebar-border pl-2.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block rounded-md px-2.5 py-1.5 text-sm transition-colors',
                              pathname === child.href
                                ? 'font-medium text-amber-700 dark:text-amber-400'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Simple nav item
              const href = 'href' in item ? item.href : '/';
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

              return (
                <Tooltip key={item.label} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-sidebar-accent font-medium text-amber-700 dark:text-amber-400'
                          : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {'badge' in item && item.badge === 'live' && (
                            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                              Live
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="text-xs">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!isCollapsed ? (
          <div className="rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
            <p className="truncate text-sm font-medium">
              {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'User'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{getRoleLabel(role)}</p>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold uppercase">
                {(user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0] ?? 'U').toUpperCase()}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{user?.fullName ?? 'Account'}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
