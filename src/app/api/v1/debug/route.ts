import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const unassigned = await prisma.reservation.findMany({
      where: {
        assignedRoomId: null,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      include: {
        roomType: true
      }
    });

    const logs: string[] = [];
    logs.push(`Found ${unassigned.length} unassigned reservations.`);

    for (const res of unassigned) {
      logs.push(`Processing Res ${res.reservationNumber} (Type: ${res.roomType?.name}) for dates ${res.checkIn} -> ${res.checkOut}`);
      
      const availableRooms = await prisma.room.findMany({
        where: { roomTypeId: res.roomTypeId, isActive: true },
        include: {
          reservations: {
            where: {
              checkIn: { lt: res.checkOut },
              checkOut: { gt: res.checkIn },
              status: { notIn: ['CANCELLED', 'NO_SHOW'] },
            }
          }
        }
      });

      logs.push(`Found ${availableRooms.length} active physical rooms for this room type.`);
      
      const freeRoom = availableRooms.find(r => r.reservations.length === 0);
      
      if (freeRoom) {
        await prisma.reservation.update({
          where: { id: res.id },
          data: { assignedRoomId: freeRoom.id }
        });
        logs.push(`SUCCESS: Assigned Res ${res.reservationNumber} to Room ${freeRoom.roomNumber}.`);
      } else {
        logs.push(`FAILED: No free room available for Res ${res.reservationNumber}. Existing rooms had overlapping reservations.`);
        // log the overlap reason
        for (const r of availableRooms) {
          logs.push(` - Room ${r.roomNumber} has ${r.reservations.length} overlapping reservations.`);
        }
      }
    }

    // Now fetch the final rooms state
    const allRooms = await prisma.room.findMany({
      include: {
        reservations: true
      }
    });

    return NextResponse.json({
      success: true,
      logs,
      rooms: allRooms.map(r => ({
        room: r.roomNumber,
        assignedCount: r.reservations.length
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
