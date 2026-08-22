import { prisma } from "@/lib/db/prisma";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { clsx } from "clsx";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const startDate = startOfDay(new Date());
  const days = Array.from({ length: 14 }).map((_, i) => addDays(startDate, i));
  const endDate = addDays(startDate, 14);

  const rooms = await prisma.room.findMany({
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

      <div className="flex-1 overflow-auto border rounded-xl shadow-sm bg-white relative">
        <div className="min-w-max inline-block align-top">
          {/* Header row */}
          <div className="flex border-b bg-gray-50 sticky top-0 z-20">
            <div className="w-48 shrink-0 border-r p-4 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-30 shadow-[1px_0_0_0_#e5e7eb]">
              Rooms
            </div>
            <div className="flex">
              {days.map((day, i) => (
                <div key={i} className="w-24 shrink-0 border-r p-2 text-center flex flex-col justify-center bg-gray-50">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{format(day, 'EEE')}</span>
                  <span className="font-medium text-gray-900">{format(day, 'MMM d')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Room rows grouped */}
          {Object.entries(groupedRooms).map(([roomType, roomsOfType]) => (
            <div key={roomType}>
              <div className="flex border-b">
                <div className="w-48 shrink-0 bg-gray-100/80 px-4 py-2 font-bold text-xs uppercase tracking-wider text-gray-600 sticky left-0 z-20 border-r shadow-[1px_0_0_0_#e5e7eb]">
                  {roomType}
                </div>
                <div className="flex flex-1 bg-gray-100/40">
                   {/* Empty filler for the group header row */}
                </div>
              </div>
              
              {roomsOfType.map(room => (
                <div key={room.id} className="flex border-b relative group h-14 hover:bg-gray-50/50">
                  <div className="w-48 shrink-0 border-r p-3 text-sm bg-white group-hover:bg-gray-50/50 sticky left-0 z-20 font-medium text-gray-900 flex items-center shadow-[1px_0_0_0_#e5e7eb]">
                    Room {room.roomNumber}
                  </div>
                  <div className="flex relative">
                    {/* Grid cells */}
                    {days.map((_, i) => (
                      <div key={i} className="w-24 shrink-0 border-r h-full"></div>
                    ))}
                    
                    {/* Reservations */}
                    {room.reservations.map(res => {
                      const checkIn = startOfDay(new Date(res.checkIn));
                      const checkOut = startOfDay(new Date(res.checkOut));
                      
                      const offsetDays = differenceInDays(checkIn, startDate);
                      const durationDays = differenceInDays(checkOut, checkIn);
                      
                      const leftPx = offsetDays * 96; 
                      const widthPx = durationDays * 96;

                      let bg = "bg-blue-500 hover:bg-blue-600";
                      if (res.status === "CHECKED_IN") bg = "bg-emerald-500 hover:bg-emerald-600";
                      else if (res.status === "CHECKED_OUT") bg = "bg-gray-500 hover:bg-gray-600";
                      
                      return (
                        <div
                          key={res.id}
                          className={clsx(
                            "absolute top-1.5 bottom-1.5 rounded-md text-white px-3 py-1.5 text-xs truncate shadow-sm transition-colors cursor-pointer z-10 flex flex-col justify-center leading-tight",
                            bg
                          )}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx - 4}px`, // -4 for a tiny gap between adjacent reservations
                            marginLeft: '2px',
                          }}
                          title={`${res.guest?.firstName} ${res.guest?.lastName} - ${res.status}`}
                        >
                          <div className="font-semibold truncate">{res.guest?.firstName} {res.guest?.lastName}</div>
                          <div className="text-[10px] opacity-90 truncate">{res.status.replace('_', ' ')}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
