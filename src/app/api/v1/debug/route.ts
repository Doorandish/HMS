import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        roomType: true,
        assignedRoom: true,
      }
    });

    return NextResponse.json({
      success: true,
      reservations: reservations.map(r => ({
        resNumber: r.reservationNumber,
        status: r.status,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        roomTypeId: r.roomTypeId,
        assignedRoomId: r.assignedRoomId,
        assignedRoomResolved: r.assignedRoom ? r.assignedRoom.roomNumber : null
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
