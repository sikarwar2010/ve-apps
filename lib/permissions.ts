export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SALES_MANAGER: 'sales_manager',
  SALES_EXECUTIVE: 'sales_executive',
  SURVEY_ENGINEER: 'survey_engineer',
  PURCHASE_MANAGER: 'purchase_manager',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  TECHNICIAN: 'technician',
  SUBSIDY_COORDINATOR: 'subsidy_coordinator',
  ACCOUNTANT: 'accountant',
  SERVICE_MANAGER: 'service_manager',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // Leads
  'leads:view': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  'leads:create': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  'leads:edit': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  'leads:delete': ['super_admin', 'admin', 'sales_manager'],
  'leads:assign': ['super_admin', 'admin', 'sales_manager'],
  'leads:convert': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],

  // Customers
  'customers:view': ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'accountant', 'service_manager'],
  'customers:create': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  'customers:edit': ['super_admin', 'admin', 'sales_manager'],
  'customers:delete': ['super_admin', 'admin'],

  // Survey
  'surveys:view': ['super_admin', 'admin', 'sales_manager', 'survey_engineer'],
  'surveys:create': ['super_admin', 'admin', 'sales_manager'],
  'surveys:complete': ['super_admin', 'admin', 'survey_engineer'],
  'surveys:assign': ['super_admin', 'admin', 'sales_manager'],

  // Quotations
  'quotations:view': ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'accountant'],
  'quotations:create': ['super_admin', 'admin', 'sales_manager', 'sales_executive'],
  'quotations:approve': ['super_admin', 'admin', 'sales_manager'],
  'quotations:approve_discount': ['super_admin', 'admin'],
  'quotations:delete': ['super_admin', 'admin'],

  // Orders
  'orders:view': ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'accountant', 'warehouse_manager'],
  'orders:create': ['super_admin', 'admin', 'sales_manager'],
  'orders:edit': ['super_admin', 'admin', 'sales_manager'],
  'orders:cancel': ['super_admin', 'admin'],

  // Purchase
  'purchase:view': ['super_admin', 'admin', 'purchase_manager', 'accountant'],
  'purchase:create_pr': ['super_admin', 'admin', 'purchase_manager', 'warehouse_manager'],
  'purchase:approve_pr': ['super_admin', 'admin', 'purchase_manager'],
  'purchase:create_po': ['super_admin', 'admin', 'purchase_manager'],
  'purchase:approve_po': ['super_admin', 'admin'],

  // Inventory
  'inventory:view': ['super_admin', 'admin', 'purchase_manager', 'warehouse_manager', 'accountant'],
  'inventory:receive': ['super_admin', 'admin', 'warehouse_manager'],
  'inventory:transfer': ['super_admin', 'admin', 'warehouse_manager'],
  'inventory:adjust': ['super_admin', 'admin', 'warehouse_manager'],

  // Dispatch
  'dispatch:view': ['super_admin', 'admin', 'warehouse_manager', 'sales_manager'],
  'dispatch:create': ['super_admin', 'admin', 'warehouse_manager'],
  'dispatch:update': ['super_admin', 'admin', 'warehouse_manager'],

  // Installation
  'installation:view': ['super_admin', 'admin', 'sales_manager', 'technician', 'service_manager'],
  'installation:schedule': ['super_admin', 'admin', 'sales_manager'],
  'installation:complete': ['super_admin', 'admin', 'technician', 'service_manager'],

  // Subsidy
  'subsidy:view': ['super_admin', 'admin', 'subsidy_coordinator', 'sales_manager', 'accountant'],
  'subsidy:create': ['super_admin', 'admin', 'subsidy_coordinator'],
  'subsidy:update': ['super_admin', 'admin', 'subsidy_coordinator'],

  // Finance
  'finance:view_invoices': ['super_admin', 'admin', 'accountant', 'sales_manager'],
  'finance:create_invoice': ['super_admin', 'admin', 'accountant'],
  'finance:record_payment': ['super_admin', 'admin', 'accountant'],
  'finance:view_reports': ['super_admin', 'admin', 'accountant'],

  // Service
  'service:view': ['super_admin', 'admin', 'service_manager', 'technician', 'sales_manager'],
  'service:create': ['super_admin', 'admin', 'service_manager', 'sales_executive'],
  'service:assign': ['super_admin', 'admin', 'service_manager'],
  'service:close': ['super_admin', 'admin', 'service_manager'],

  // Settings
  'settings:view': ['super_admin', 'admin'],
  'settings:edit': ['super_admin', 'admin'],
  'settings:users': ['super_admin', 'admin'],
  'settings:roles': ['super_admin'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  if (!Object.prototype.hasOwnProperty.call(PERMISSIONS, permission)) {
    return false;
  }
  const allowedRoles: readonly Role[] = PERMISSIONS[permission];
  return allowedRoles.includes(role);
}

export function getRoleLabel(role: Role | null | undefined): string {
  const roleLabels: Record<Role, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    sales_manager: 'Sales Manager',
    sales_executive: 'Sales Executive',
    survey_engineer: 'Survey Engineer',
    purchase_manager: 'Purchase Manager',
    warehouse_manager: 'Warehouse Manager',
    technician: 'Technician',
    subsidy_coordinator: 'Subsidy Coordinator',
    accountant: 'Accountant',
    service_manager: 'Service Manager',
  };
  if (role && Object.prototype.hasOwnProperty.call(roleLabels, role)) {
    return roleLabels[role];
  }
  return 'Guest';
}

export function getAllowedRoles(permission: Permission): readonly Role[] {
  if (!Object.prototype.hasOwnProperty.call(PERMISSIONS, permission)) {
    return [];
  }
  return PERMISSIONS[permission];
}

export function hasSomePermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
