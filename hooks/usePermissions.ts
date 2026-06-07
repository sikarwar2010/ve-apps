'use client';
import { api } from '@/convex/_generated/api';
import { hasPermission, type Permission } from '@/lib/permissions';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { useCallback } from 'react';

export function usePermissions() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const dbUser = useQuery(api.modules.users.getUserByClerkId, user?.id ? { clerkId: user.id } : 'skip');

  const isLoading = Boolean(user?.id && dbUser === undefined);

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
    isLoading: isLoading || !isClerkLoaded,
    hasDbUser: Boolean(dbUser),
  };
}
