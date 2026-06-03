'use client';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/lib/permissions';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = usePermissions();
  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  return <>{children}</>;
}

// Usage:
// <PermissionGuard permission="leads:delete">
//   <Button variant="destructive">Delete</Button>
// </PermissionGuard>
