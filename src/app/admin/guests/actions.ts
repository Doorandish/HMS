'use server';

import prisma from '@/lib/db/prisma';

export async function purgeGuestData(guestId: string) {
  try {
    const guest = await prisma.guestProfile.findUnique({
      where: { id: guestId }
    });

    if (!guest) {
      return { success: false, error: 'Guest not found' };
    }

    const obfuscatedId = guestId.substring(0, 8); // simple deterministic suffix for email

    await prisma.guestProfile.update({
      where: { id: guestId },
      data: {
        identityDocEncrypted: null,
        meldescheinData: null,
        email: `deleted-${obfuscatedId}@obfuscated.local`,
        firstName: 'Purged',
        lastName: 'User',
        phone: null,
        dateOfBirth: null,
        nationality: null,
        notes: null
      }
    });

    return { success: true, message: 'Guest data successfully purged.' };
  } catch (error) {
    console.error('GDPR Purge Error:', error);
    return { success: false, error: 'Failed to purge guest data.' };
  }
}
