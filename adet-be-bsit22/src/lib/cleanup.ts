import prisma from './prisma';

/**
 * Scholarly Cleanup: Automated purge of expired activity notifications.
 * Removes read notifications older than 7 days that are not starred.
 */
export async function purgeExpiredNotifications() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const result = await prisma.notification.deleteMany({
      where: {
        read: true,
        isSaved: false,
        createdAt: { lt: sevenDaysAgo }
      }
    });
    console.log(`[Institutional Cleanup] Purged ${result.count} expired notification records.`);
    return result.count;
  } catch (error) {
    console.error('[System Failure] Institutional cleanup failed:', error);
    throw error;
  }
}
