import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ============================================================
  // USERS & AUTH
  // ============================================================
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal('super_admin'),
      v.literal('admin'),
      v.literal('sales_manager'),
      v.literal('sales_executive'),
      v.literal('survey_engineer'),
      v.literal('purchase_manager'),
      v.literal('warehouse_manager'),
      v.literal('technician'),
      v.literal('subsidy_coordinator'),
      v.literal('accountant'),
      v.literal('service_manager'),
    ),
    branchId: v.optional(v.id('branches')),
    isActive: v.boolean(),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email'])
    .index('by_role', ['role']),
});
