'use client';

import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { useEffect, useRef } from 'react';

export function UserBootstrap() {
  const { isLoaded, isSignedIn } = useUser();
  const ensureUser = useMutation(api.modules.users.ensureCurrentUser);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || syncedRef.current) {
      return;
    }

    syncedRef.current = true;
    void ensureUser().catch((error) => {
      syncedRef.current = false;
      console.error('Failed to sync Clerk user to Convex:', error);
    });
  }, [ensureUser, isLoaded, isSignedIn]);

  return null;
}
