'use server';

import prisma from '@/lib/db/prisma';
import { ReservationStatus, PaymentStatus } from '@prisma/client';

export async function exportReservationsCSV(tenantId?: string) {
  try {
    const whereClause = tenantId ? { tenantId } : {};
    
    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        guest: true,
        roomType: true,
      },
      orderBy: { checkIn: 'desc' },
    });

    if (reservations.length === 0) {
      return { success: true, csv: 'Reservation Number,Guest Name,Check In,Check Out,Status,Total Amount,Currency\n' };
    }

    // GoBD basic fields
    const headers = ['Reservation Number', 'Guest Name', 'Check In', 'Check Out', 'Status', 'Total Amount', 'Currency', 'Payment Status'];
    const rows = reservations.map(r => {
      const guestName = r.guest ? `${r.guest.firstName} ${r.guest.lastName}`.trim() : 'Unknown';
      return [
        r.reservationNumber,
        `"${guestName.replace(/"/g, '""')}"`,
        r.checkIn.toISOString().split('T')[0],
        r.checkOut.toISOString().split('T')[0],
        r.status,
        r.totalAmount.toString(),
        r.currency,
        r.paymentStatus
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    return { success: true, csv: csvContent };
  } catch (error) {
    console.error('CSV Export Error:', error);
    return { success: false, error: 'Failed to export reservations.' };
  }
}
