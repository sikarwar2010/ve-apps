import type { Permission } from '@/lib/permissions';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Calculator,
  ClipboardList,
  FileText,
  FolderOpen,
  Gauge,
  Headphones,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserCircle,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react';

export type NavChild = { label: string; href: string };

export type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: Permission | null;
  badge?: 'live';
  children?: NavChild[];
};

export type NavGroup = {
  section?: string;
  items: NavItem[];
};

export const NAV_STRUCTURE: NavGroup[] = [
  {
    items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard, permission: null }],
  },
  {
    section: 'CRM',
    items: [
      { label: 'Leads', href: '/crm/lead', icon: Users, permission: 'leads:view', badge: 'live' },
      { label: 'Customers', href: '/crm/customers', icon: UserCircle, permission: 'customers:view' },
    ],
  },
  {
    section: 'Pre-Sales',
    items: [
      { label: 'Site Survey', href: '/survey', icon: MapPin, permission: 'surveys:view' },
      { label: 'Quotations', href: '/quotations', icon: FileText, permission: 'quotations:view' },
      { label: 'Sales Orders', href: '/orders', icon: ShoppingCart, permission: 'orders:view' },
    ],
  },
  {
    section: 'Supply Chain',
    items: [
      {
        label: 'Procurement',
        icon: Package,
        permission: 'purchase:view',
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
        permission: 'inventory:view',
        children: [
          { label: 'Stock', href: '/inventory' },
          { label: 'Movements', href: '/inventory/movements' },
          { label: 'Transfers', href: '/inventory/stock-transfer' },
        ],
      },
      { label: 'Dispatch', href: '/dispatch', icon: Truck, permission: 'dispatch:view' },
    ],
  },
  {
    section: 'Execution',
    items: [
      { label: 'Installation', href: '/installation', icon: Wrench, permission: 'installation:view' },
      { label: 'Net Meter', href: '/net-meter', icon: Gauge, permission: 'orders:view' },
    ],
  },
  {
    section: 'Compliance',
    items: [
      { label: 'PM Surya Subsidy', href: '/subsidy', icon: IndianRupee, permission: 'subsidy:view', badge: 'live' },
    ],
  },
  {
    section: 'Finance',
    items: [
      {
        label: 'Accounts',
        icon: Calculator,
        permission: 'finance:view_invoices',
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
      { label: 'Service Tickets', href: '/service/tickets', icon: Headphones, permission: 'service:view' },
      { label: 'Warranty', href: '/service/warranty', icon: Headphones, permission: 'service:view' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Reports', href: '/reports', icon: BarChart3, permission: 'finance:view_reports' },
      { label: 'Documents', href: '/documents', icon: FolderOpen, permission: null },
      { label: 'Audit Logs', href: '/audit-logs', icon: ClipboardList, permission: 'settings:view' },
      { label: 'Settings', href: '/settings', icon: Settings, permission: 'settings:view' },
    ],
  },
];
