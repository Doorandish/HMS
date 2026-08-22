'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';

async function getTenantId() {
  const headersList = await headers();
  const slug = headersList.get('x-tenant-slug');
  if (!slug) throw new Error('Tenant not found');

  const tenant = await resolveTenant(slug);
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

    // TRIGGER OUTBOUND CHANNEL MANAGER SYNC (Async, non-blocking)
    // In production, you would place this in a reliable background queue (e.g. Inngest / RabbitMQ)
    // to ensure delivery if the Channel Manager API is temporarily down.
    try {
      const channelManagerUrl = process.env.CHANNEX_API_URL || 'https://mock.channex.io/api/v1/restrictions';
      if (process.env.CHANNEX_API_KEY) {
        fetch(channelManagerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CHANNEX_API_KEY}`
          },
          body: JSON.stringify({
            property_id: tenantId, // mapped ID
            room_type_id: data.roomTypeId,
            date: rateDate.toISOString(),
            price: data.price,
            min_stay: data.minStay,
            max_stay: data.maxStay,
            stop_sell: data.stopSell
          })
        }).catch(err => console.error('[ChannelManager] Failed to sync rate update:', err));
      }
    } catch (err) {
      console.error('[ChannelManager] Error pushing update:', err);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
