export async function generateDocumentNumber(ctx: any, prefix: string): Promise<string> {
  // Atomic counter using Convex
  const counter = await ctx.db
    .query('documentCounters')
    .filter((q: any) => q.eq(q.field('prefix'), prefix))
    .unique();

  const currentYear = new Date().getFullYear().toString().slice(-2);
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  let nextNumber: number;
  if (!counter) {
    await ctx.db.insert('documentCounters', {
      prefix,
      lastNumber: 1,
      updatedAt: Date.now(),
    });
    nextNumber = 1;
  } else {
    nextNumber = counter.lastNumber + 1;
    await ctx.db.patch(counter._id, {
      lastNumber: nextNumber,
      updatedAt: Date.now(),
    });
  }

  const paddedNumber = String(nextNumber).padStart(5, '0');
  return `${prefix}-${currentYear}${currentMonth}-${paddedNumber}`;
  // e.g. LEAD-2501-00001, QT-2501-00023, SO-2501-00005
}
