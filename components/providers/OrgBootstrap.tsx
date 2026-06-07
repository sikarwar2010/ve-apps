'use client';

import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useEffect } from 'react';

/** Ensures company, branch, warehouse, and product catalog exist */
export function OrgBootstrap() {
  const ensureOrg = useMutation(api.modules.seed.ensureOrganization);

  useEffect(() => {
    void ensureOrg({});
  }, [ensureOrg]);

  return null;
}
