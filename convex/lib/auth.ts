import type { Doc } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';

export async function getOrCreateUser(ctx: MutationCtx): Promise<Doc<'users'>> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Unauthenticated');
  }

  const existing = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
    .unique();

  if (existing) {
    return existing;
  }

  const email = identity.email ?? `${identity.subject}@users.clerk`;
  const name = identity.name?.trim() || email.split('@')[0] || 'User';
  const now = Date.now();

  const hasUsers = (await ctx.db.query('users').first()) !== null;

  const userId = await ctx.db.insert('users', {
    clerkId: identity.subject,
    email,
    name,
    role: hasUsers ? 'sales_executive' : 'super_admin',
    isActive: true,
    avatarUrl: identity.pictureUrl,
    createdAt: now,
    updatedAt: now,
  });

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}
