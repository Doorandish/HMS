import { prisma } from "@/lib/db/prisma";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { clsx } from "clsx";
import { TapeChartClient } from './TapeChartClient';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const startDate = startOfDay(new Date());
  const days = Array.from({ length: 14 }).map((_, i) => addDays(startDate, i));
  const endDate = addDays(startDate, 14);

  let rooms = await prisma.room.findMany({
    include: {
      roomType: true,
      reservations: {
        where: {
          checkIn: { lt: endDate },
          checkOut: { gt: startDate },
          status: { notIn: ['CANCELLED', 'NO_SHOW'] }
        },
        include: { guest: true },
      },
    },
    orderBy: [
      { roomType: { name: 'asc' } },
      { roomNumber: 'asc' },
    ],
  });

  const tenantId = rooms[0]?.roomType?.tenantId;

  if (tenantId) {
    // Self-heal: find unassigned reservations and auto-assign them
    const unassigned = await prisma.reservation.findMany({
      where: {
        tenantId,
        OR: [
          { assignedRoomId: null },
          { assignedRoomId: { isSet: false } }
        ],
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      }
    });

    if (unassigned.length > 0) {
      let madeChanges = false;
      for (const res of unassigned) {
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
        const freeRoom = availableRooms.find(r => r.reservations.length === 0);
        if (freeRoom) {
          await prisma.reservation.update({
            where: { id: res.id },
            data: { assignedRoomId: freeRoom.id }
          });
          madeChanges = true;
        }
      }

      if (madeChanges) {
        // Re-fetch rooms with updated reservations
        rooms = await prisma.room.findMany({
          include: {
            roomType: true,
            reservations: {
              where: {
                checkIn: { lt: endDate },
                checkOut: { gt: startDate },
                status: { notIn: ['CANCELLED', 'NO_SHOW'] }
              },
              include: { guest: true },
            },
          },
          orderBy: [
            { roomType: { name: 'asc' } },
            { roomNumber: 'asc' },
          ],
        });
      }
    }
  }

  const groupedRooms = rooms.reduce((acc, room) => {
    const type = room.roomType.name;
    if (!acc[type]) acc[type] = [];
    acc[type].push(room);
    return acc;
  }, {} as Record<string, typeof rooms>);

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tape Chart</h1>
          <p className="text-gray-500 mt-1">Next 14 Days</p>
        </div>
      </div>
      
      <TapeChartClient 
        days={days} 
        groupedRooms={groupedRooms} 
        startDate={startDate} 
        tenantId={rooms[0]?.roomType?.tenantId || ''} 
      />
    </div>
  )
}
