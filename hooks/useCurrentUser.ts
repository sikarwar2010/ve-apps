'use client';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useCurrentUser() {
  const { user: clerkUser, isLoaded } = useUser();
  const dbUser = useQuery(api.modules.users.getUserByClerkId, clerkUser?.id ? { clerkId: clerkUser.id } : 'skip');

  return {
    user: dbUser,
    clerkUser,
    isLoaded: isLoaded && !!dbUser,
    isAdmin: dbUser?.role === 'super_admin' || dbUser?.role === 'admin',
  };
}
