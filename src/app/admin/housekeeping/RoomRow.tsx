'use client';

import { useTransition } from "react";
import { updateRoomStatus } from "./actions";
import { RoomStatus } from "@prisma/client";
import { CheckCircle2, AlertCircle, XCircle, Search } from "lucide-react";
import { clsx } from "clsx";

interface RoomRowProps {
  room: {
    id: string;
    roomNumber: string;
    status: RoomStatus;
    roomType: {
      name: string;
    };
  };
}

export function RoomRow({ room }: RoomRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as RoomStatus;
    startTransition(() => {
      updateRoomStatus(room.id, newStatus);
    });
  };

  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'CLEAN':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'DIRTY':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'INSPECTED':
        return <Search className="w-5 h-5 text-blue-500" />;
      case 'OUT_OF_SERVICE':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: RoomStatus) => {
    switch (status) {
      case 'CLEAN':
        return 'bg-emerald-100 text-emerald-800';
      case 'DIRTY':
        return 'bg-rose-100 text-rose-800';
      case 'INSPECTED':
        return 'bg-blue-100 text-blue-800';
      case 'OUT_OF_SERVICE':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className={clsx("border-b hover:bg-gray-50 transition-colors", isPending && "opacity-50")}>
      <td className="p-4 font-medium">{room.roomNumber}</td>
      <td className="p-4 text-gray-600">{room.roomType.name}</td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(room.status)}
          <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold", getStatusBadgeClass(room.status))}>
            {room.status.replace(/_/g, ' ')}
          </span>
        </div>
      </td>
      <td className="p-4">
        <select
          value={room.status}
          onChange={handleStatusChange}
          disabled={isPending}
          className="border border-gray-300 rounded-md text-sm py-1.5 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
        >
          <option value="CLEAN">Clean</option>
          <option value="DIRTY">Dirty</option>
          <option value="INSPECTED">Inspected</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </td>
    </tr>
  );
}
