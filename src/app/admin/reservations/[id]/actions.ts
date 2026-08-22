'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { ReservationStatus } from '@prisma/client';

export async function updateReservationStatus(reservationId: string, status: ReservationStatus) {
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status }
  });

  revalidatePath(`/admin/reservations/${reservationId}`);
  revalidatePath(`/admin/calendar`);
  revalidatePath(`/admin/dashboard`);
}
