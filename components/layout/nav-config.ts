import type { Permission } from '@/lib/permissions';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, FileText, LayoutDashboard, MapPin, Settings, ShoppingCart, UserCircle, Users } from 'lucide-react';

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

/** Focused navigation: CRM + Pre-Sales pipeline only */
export const NAV_STRUCTURE: NavGroup[] = [
  {
    items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard, permission: null }],
  },
  {
    section: 'CRM',
    items: [
      { label: 'Leads', href: '/crm/leads', icon: Users, permission: 'leads:view', badge: 'live' },
      { label: 'Customers', href: '/crm/customers', icon: UserCircle, permission: 'customers:view' },
    ],
  },
  {
    section: 'Pre-Sales',
    items: [
      { label: 'Site Survey', href: '/survey', icon: MapPin, permission: 'surveys:view', badge: 'live' },
      { label: 'Quotations', href: '/quotations', icon: FileText, permission: 'quotations:view', badge: 'live' },
      { label: 'Sales Orders', href: '/orders', icon: ShoppingCart, permission: 'orders:view', badge: 'live' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Reports', href: '/reports', icon: BarChart3, permission: 'finance:view_reports' },
      { label: 'Settings', href: '/settings', icon: Settings, permission: 'settings:view' },
    ],
  },
];
