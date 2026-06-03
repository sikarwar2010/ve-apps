'use client';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { hasPermission, type Permission } from '@/lib/permissions';
import { useCallback } from 'react';

export function usePermissions() {
  const { user } = useUser();
  const dbUser = useQuery(api.modules.users.getUserByClerkId, user?.id ? { clerkId: user.id } : 'skip');

  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      if (!dbUser) return false;
      return hasPermission(dbUser.role, permission);
    },
    [dbUser],
  );

  return {
    hasPermission: checkPermission,
    role: dbUser?.role,
    user: dbUser,
    isLoading: !dbUser,
  };
}
