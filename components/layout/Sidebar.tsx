'use client';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';
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
      { label: 'Leads', href: '/crm/leads', icon: Users, permission: 'leads:view' as const, badge: 'live' },
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
  const { hasPermission } = usePermissions();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Procurement', 'Inventory', 'Accounts']);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-background border-r transition-all duration-200 shrink-0',
        isCollapsed ? 'w-14' : 'w-52.5',
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-12 px-3 border-b gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-white shrink-0">
          <Sun className="h-4 w-4" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-none truncate">SuryaERP</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">PM Surya Ghar</p>
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto shrink-0" onClick={toggleCollapse}>
          <PanelLeft className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-1.5">
        {NAV_STRUCTURE.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.section && !isCollapsed && (
              <p className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
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
                      onClick={() => toggleExpand(item.label)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                        isChildActive
                          ? 'bg-amber-50 text-amber-700 font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </>
                      )}
                    </button>
                    {isExpanded && !isCollapsed && (
                      <div className="ml-5 mt-0.5 space-y-0.5 pl-2 border-l border-border">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-2 py-1 rounded-sm text-xs transition-colors',
                              pathname === child.href
                                ? 'text-amber-700 font-medium'
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
                        'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                        isActive
                          ? 'bg-amber-50 text-amber-700 font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
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
    </aside>
  );
}
