'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { format, differenceInDays, startOfDay } from 'date-fns';
import { NewReservationModal } from './NewReservationModal';
import { useRouter } from 'next/navigation';

export function TapeChartClient({ 
  days, 
  groupedRooms, 
  startDate,
  tenantId
}: { 
  days: Date[], 
  groupedRooms: Record<string, any[]>,
  startDate: Date,
  tenantId: string
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const router = useRouter();

  const handleCellClick = (room: any, date: Date) => {
    setSelectedRoom(room);
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleReservationClick = (resId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/reservations/${resId}`);
  };

  return (
    <>
      <div className="flex-1 overflow-auto border rounded-xl shadow-sm bg-white relative">
        <div className="min-w-max inline-block align-top">
          {/* Header row */}
          <div className="flex border-b bg-gray-50 sticky top-0 z-30">
            <div className="w-48 shrink-0 border-r p-4 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-40 shadow-[1px_0_0_0_#e5e7eb]">
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
                <div className="w-48 shrink-0 bg-gray-100/80 px-4 py-2 font-bold text-xs uppercase tracking-wider text-gray-600 sticky left-0 z-30 border-r shadow-[1px_0_0_0_#e5e7eb]">
                  {roomType}
                </div>
                <div className="flex flex-1 bg-gray-100/40"></div>
              </div>
              
              {roomsOfType.map(room => (
                <div key={room.id} className="flex border-b relative group h-14 hover:bg-gray-50/50">
                  <div className="w-48 shrink-0 border-r p-3 text-sm bg-white group-hover:bg-gray-50/50 sticky left-0 z-30 font-medium text-gray-900 flex items-center shadow-[1px_0_0_0_#e5e7eb]">
                    Room {room.roomNumber}
                  </div>
                  <div className="flex relative">
                    {/* Grid cells (Clickable) */}
                    {days.map((day, i) => (
                      <div 
                        key={i} 
                        className="w-24 shrink-0 border-r h-full cursor-pointer hover:bg-blue-50/50 transition-colors"
                        onClick={() => handleCellClick(room, day)}
                      ></div>
                    ))}
                    
                    {/* Reservations */}
                    {room.reservations.map((res: any) => {
                      const checkIn = startOfDay(new Date(res.checkIn));
                      const checkOut = startOfDay(new Date(res.checkOut));
                      
                      const checkInTime = checkIn.getTime();
                      const checkOutTime = checkOut.getTime();
                      const startTime = startDate.getTime();

                      const offsetDays = Math.max(0, Math.round((checkInTime - startTime) / (1000 * 60 * 60 * 24)));
                      const durationDays = Math.max(1, Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)));
                      
                      const leftPx = offsetDays * 96; 
                      const widthPx = durationDays * 96;

                      let bg = "bg-blue-500 hover:bg-blue-600";
                      if (res.status === "CHECKED_IN") bg = "bg-emerald-500 hover:bg-emerald-600";
                      else if (res.status === "CHECKED_OUT") bg = "bg-gray-500 hover:bg-gray-600";
                      
                      return (
                        <div
                          key={res.id}
                          onClick={(e) => handleReservationClick(res.id, e)}
                          className={clsx(
                            "absolute top-1.5 bottom-1.5 rounded-md text-white px-3 py-1.5 text-xs truncate shadow-sm transition-colors cursor-pointer z-20 flex flex-col justify-center leading-tight",
                            bg
                          )}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx - 4}px`,
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

      {modalOpen && selectedDate && selectedRoom && (
        <NewReservationModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)}
          defaultDate={selectedDate}
          room={selectedRoom}
          tenantId={tenantId}
        />
      )}
    </>
  );
}
