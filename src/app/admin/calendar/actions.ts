'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { ReservationStatus, PaymentStatus } from '@prisma/client';

export async function createManualReservation(formData: FormData) {
  try {
    const tenantId = formData.get('tenantId') as string;
    const roomId = formData.get('roomId') as string;
    const roomTypeId = formData.get('roomTypeId') as string;
    const checkIn = new Date(formData.get('checkIn') as string);
    const checkOut = new Date(formData.get('checkOut') as string);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const price = parseFloat(formData.get('price') as string);
    const paymentStatusForm = formData.get('paymentStatus') as string;

    // Check for overlapping reservations manually (since we don't have true Mongo transactions available without replica sets)
    const overlap = await prisma.reservation.findFirst({
      where: {
        assignedRoomId: roomId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn }
      }
    });

    if (overlap) {
      return { error: 'Room is already booked for these dates.' };
    }

    // Upsert Guest
    const guest = await prisma.guestProfile.upsert({
      where: {
        tenantId_email: {
          tenantId,
          email
        }
      },
      update: {
        firstName,
        lastName
      },
      create: {
        tenantId,
        email,
        firstName,
        lastName
      }
    });

    // Create Reservation
    const reservationNumber = `MAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const pStatus = paymentStatusForm === 'PAID' ? PaymentStatus.PAID : PaymentStatus.PENDING;

    const reservation = await prisma.reservation.create({
      data: {
        tenantId,
        reservationNumber,
        guestId: guest.id,
        roomTypeId,
        assignedRoomId: roomId,
        checkIn,
        checkOut,
        source: 'MANUAL',
        status: ReservationStatus.CONFIRMED,
        subtotalAmount: price,
        totalAmount: price,
        paymentStatus: pStatus,
        payments: pStatus === PaymentStatus.PAID ? {
          create: [{
            amount: price,
            method: 'cash',
            status: PaymentStatus.PAID
          }]
        } : undefined
      }
    });

    revalidatePath('/admin/calendar');
    revalidatePath('/admin/dashboard');

    return { success: true, reservationId: reservation.id };
  } catch (error: any) {
    console.error('Manual booking error:', error);
    return { error: error.message || 'Failed to create reservation.' };
  }
}
