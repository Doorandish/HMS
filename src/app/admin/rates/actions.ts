'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

async function getTenantId() {
  const headersList = await headers();
  const slug = headersList.get('x-tenant-slug');
  if (!slug) throw new Error('Tenant not found');

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: slug },
    select: { id: true },
  });

  if (!tenant) throw new Error('Tenant not found');
  return tenant.id;
}

export async function upsertDailyRate(data: {
  roomTypeId: string;
  date: Date;
  price?: number;
  minStay?: number;
  maxStay?: number;
  stopSell?: boolean;
}) {
  try {
    // We check tenant authorization to be safe
    const tenantId = await getTenantId();
    const roomType = await prisma.roomType.findFirst({
      where: { id: data.roomTypeId, tenantId },
    });
    if (!roomType) throw new Error('RoomType not found or does not belong to tenant');

    // Make sure we set time to 00:00:00 for the date to avoid duplicates
    const rateDate = new Date(data.date);
    rateDate.setUTCHours(0, 0, 0, 0);

    const existingRate = await prisma.dailyRate.findUnique({
      where: {
        roomTypeId_date: {
          roomTypeId: data.roomTypeId,
          date: rateDate,
        },
      },
    });

    if (existingRate) {
      await prisma.dailyRate.update({
        where: { id: existingRate.id },
        data: {
          ...(data.price !== undefined && { price: data.price }),
          ...(data.minStay !== undefined && { minStay: data.minStay }),
          ...(data.maxStay !== undefined && { maxStay: data.maxStay }),
          ...(data.stopSell !== undefined && { stopSell: data.stopSell }),
        },
      });
    } else {
      await prisma.dailyRate.create({
        data: {
          roomTypeId: data.roomTypeId,
          date: rateDate,
          price: data.price ?? 0,
          minStay: data.minStay ?? 1,
          maxStay: data.maxStay ?? 365,
          stopSell: data.stopSell ?? false,
          availableCount: roomType.maxOccupancy, // Arbitrary starting point if not tracking strict inventory yet
        },
      });
    }

    revalidatePath('/admin/rates');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
