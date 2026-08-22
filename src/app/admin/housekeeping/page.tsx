import { prisma } from "@/lib/db/prisma";
import { RoomRow } from "./RoomRow";

export const dynamic = 'force-dynamic';

export default async function HousekeepingPage() {
  const rooms = await prisma.room.findMany({
    include: {
      roomType: true,
    },
    orderBy: [
      { roomNumber: 'asc' },
    ],
  });

  const totalRooms = rooms.length;
  const cleanRooms = rooms.filter(r => r.status === 'CLEAN').length;
  const dirtyRooms = rooms.filter(r => r.status === 'DIRTY').length;
  const inspectedRooms = rooms.filter(r => r.status === 'INSPECTED').length;
  const oosRooms = rooms.filter(r => r.status === 'OUT_OF_SERVICE').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping</h1>
          <p className="text-gray-500 mt-1">Manage room status and cleaning operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500 font-medium">Clean</div>
          <div className="text-2xl font-bold text-emerald-600">{cleanRooms}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500 font-medium">Dirty</div>
          <div className="text-2xl font-bold text-rose-600">{dirtyRooms}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500 font-medium">Inspected</div>
          <div className="text-2xl font-bold text-blue-600">{inspectedRooms}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500 font-medium">Out of Service</div>
          <div className="text-2xl font-bold text-gray-600">{oosRooms}</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-sm text-gray-600">Room Number</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Type</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Current Status</th>
              <th className="p-4 font-semibold text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <RoomRow key={room.id} room={room} />
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
