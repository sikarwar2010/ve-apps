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
  MapPin,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserCircle,
  Warehouse,
  Wrench,
} from 'lucide-react';

export type ModulePageConfig = {
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
  features: string[];
  primaryHref?: string;
  primaryLabel?: string;
};

export const MODULE_PAGES: Record<string, ModulePageConfig> = {
  customers: {
    title: 'Customers',
    description: 'Converted leads with KYC, DISCOM details, and bank info for subsidy disbursement.',
    icon: UserCircle,
    phase: 'CRM',
    features: [
      'Customer master & KYC',
      'Aadhaar / PAN capture',
      'Account manager assignment',
      'Lead conversion history',
    ],
    primaryHref: '/crm/leads',
    primaryLabel: 'View leads',
  },
  survey: {
    title: 'Site Survey',
    description: 'Engineer-led rooftop assessment, shadow analysis, and system sizing recommendations.',
    icon: MapPin,
    phase: 'Pre-Sales',
    features: ['Survey scheduling', 'GPS & photo capture', 'Structural checklist', 'Recommended kW output'],
  },
  quotations: {
    title: 'Quotations',
    description: 'Build GST-compliant quotes with PM Surya subsidy estimation and payment milestones.',
    icon: FileText,
    phase: 'Pre-Sales',
    features: ['Line-item builder', 'Subsidy auto-calc', 'PDF export', 'Version history'],
  },
  orders: {
    title: 'Sales Orders',
    description: 'Confirmed deals with payment schedules from token to subsidy release.',
    icon: ShoppingCart,
    phase: 'Pre-Sales',
    features: ['Order confirmation', 'Milestone payments', 'Financing tracking', 'Agreement storage'],
  },
  requisitions: {
    title: 'Purchase Requisitions',
    description: 'Material requests linked to sales orders with approval workflow.',
    icon: Package,
    phase: 'Supply Chain',
    features: ['SO-linked PR', 'Stock availability check', 'Manager approval', 'PO conversion'],
  },
  rfq: {
    title: 'RFQ',
    description: 'Request quotes from OEMs and distributors for panels, inverters, and structures.',
    icon: Package,
    phase: 'Supply Chain',
    features: ['Multi-vendor RFQ', 'Rate comparison', 'Vendor rating', 'PO generation'],
  },
  'purchase-orders': {
    title: 'Purchase Orders',
    description: 'GST purchase orders with delivery tracking and GRN linkage.',
    icon: Package,
    phase: 'Supply Chain',
    features: ['Vendor PO', 'GST breakup', 'Delivery schedule', 'Partial receipts'],
  },
  grn: {
    title: 'Goods Receipt (GRN)',
    description: 'Receive inventory with batch/serial tracking and damage reporting.',
    icon: Package,
    phase: 'Supply Chain',
    features: ['PO-linked GRN', 'Serial capture', 'Stock posting', 'Damage qty'],
  },
  inventory: {
    title: 'Inventory',
    description: 'Real-time stock across warehouses with reorder alerts.',
    icon: Warehouse,
    phase: 'Supply Chain',
    features: ['Warehouse stock', 'Reserved qty', 'Low stock alerts', 'SKU catalog'],
  },
  movements: {
    title: 'Stock Movements',
    description: 'Audit trail of every GRN, dispatch, transfer, and adjustment.',
    icon: Warehouse,
    phase: 'Supply Chain',
    features: ['Movement ledger', 'Reference linking', 'Batch trace', 'User accountability'],
  },
  'stock-transfer': {
    title: 'Stock Transfers',
    description: 'Move material between branch warehouses with dual-side posting.',
    icon: Warehouse,
    phase: 'Supply Chain',
    features: ['Inter-warehouse transfer', 'In-transit tracking', 'Approval flow'],
  },
  dispatch: {
    title: 'Dispatch',
    description: 'Pick, pack, and ship material to installation sites with LR tracking.',
    icon: Truck,
    phase: 'Supply Chain',
    features: ['Picking list', 'Delivery challan', 'Transporter LR', 'POD capture'],
  },
  installation: {
    title: 'Installation',
    description: 'Technician jobs with installation & commissioning checklists.',
    icon: Wrench,
    phase: 'Execution',
    features: ['Job scheduling', 'Checklist completion', 'Photo evidence', 'Customer sign-off'],
  },
  'net-meter': {
    title: 'Net Meter',
    description: 'DISCOM application tracking from submission to meter activation.',
    icon: Gauge,
    phase: 'Execution',
    features: ['DISCOM application', 'Inspection dates', 'Approval status', 'Activation tracking'],
  },
  subsidy: {
    title: 'PM Surya Subsidy',
    description: 'Central subsidy application lifecycle with document checklist.',
    icon: IndianRupee,
    phase: 'Compliance',
    features: ['Portal submission', 'Document KYC', 'Inspection tracking', 'Disbursement status'],
  },
  invoices: {
    title: 'Invoices',
    description: 'Tax invoices with CGST/SGST/IGST and receivables tracking.',
    icon: Calculator,
    phase: 'Finance',
    features: ['Tax invoice', 'Proforma', 'Credit notes', 'PDF generation'],
  },
  payments: {
    title: 'Payments',
    description: 'Record customer receipts and vendor payments with UPI/NEFT modes.',
    icon: Calculator,
    phase: 'Finance',
    features: ['Payment receipt', 'Invoice allocation', 'Vendor payments', 'Bank reconciliation'],
  },
  ledger: {
    title: 'Ledger',
    description: 'Customer and vendor account statements with aging analysis.',
    icon: Calculator,
    phase: 'Finance',
    features: ['Account statement', 'Aging report', 'Outstanding summary'],
  },
  tickets: {
    title: 'Service Tickets',
    description: 'After-sales complaints, warranty claims, and AMC visits.',
    icon: Headphones,
    phase: 'After-Sales',
    features: ['Ticket creation', 'Technician assignment', 'Warranty check', 'Resolution tracking'],
  },
  warranty: {
    title: 'Warranty',
    description: 'Track product and workmanship warranty expiry per installation.',
    icon: Headphones,
    phase: 'After-Sales',
    features: ['Warranty registry', 'Expiry alerts', 'Claim history'],
  },
  reports: {
    title: 'Reports & MIS',
    description: 'Sales funnel, revenue charts, subsidy pipeline, and team leaderboard.',
    icon: BarChart3,
    phase: 'Admin',
    features: ['MIS dashboard', 'Revenue charts', 'Aging receivables', 'Sales leaderboard'],
  },
  documents: {
    title: 'Documents',
    description: 'Central repository for quotations, agreements, and compliance files.',
    icon: FolderOpen,
    phase: 'Admin',
    features: ['Document vault', 'Entity linking', 'Convex file storage'],
  },
  'audit-logs': {
    title: 'Audit Logs',
    description: 'Immutable change history across leads, orders, inventory, and finance.',
    icon: ClipboardList,
    phase: 'Admin',
    features: ['User actions', 'Before/after values', 'Entity filtering'],
  },
  settings: {
    title: 'Settings',
    description: 'Company profile, branches, warehouses, users, roles, and product catalog.',
    icon: Settings,
    phase: 'Admin',
    features: ['Company & GSTIN', 'User management', 'RBAC roles', 'SKU master'],
  },
};
