import type { GenericMutationCtx } from 'convex/server';

import type { DataModel, Id } from '../_generated/dataModel';

type AuditParams = {
  userId: Id<'users'>;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
  userAgent?: string;
};

export async function logAudit(ctx: Pick<GenericMutationCtx<DataModel>, 'db'>, params: AuditParams): Promise<void> {
  await ctx.db.insert('auditLogs', {
    userId: params.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    oldValues: params.oldValues,
    newValues: params.newValues,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    createdAt: Date.now(),
  });
}
