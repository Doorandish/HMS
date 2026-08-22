'use client';

import React, { useState } from 'react';
import { updateReservationStatus } from './actions';
import { CheckCircle, XCircle, LogOut } from 'lucide-react';
import { ReservationStatus } from '@prisma/client';

export function StatusActions({ reservationId, currentStatus }: { reservationId: string, currentStatus: ReservationStatus }) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: ReservationStatus) => {
    setLoading(true);
    try {
      await updateReservationStatus(reservationId, status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {currentStatus === 'CONFIRMED' && (
        <>
          <button 
            onClick={() => handleStatusChange('CHECKED_IN')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle size={16} /> Check In
          </button>
          <button 
            onClick={() => handleStatusChange('CANCELLED')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
          >
            <XCircle size={16} /> Cancel
          </button>
        </>
      )}

      {currentStatus === 'CHECKED_IN' && (
        <button 
          onClick={() => handleStatusChange('CHECKED_OUT')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
        >
          <LogOut size={16} /> Check Out
        </button>
      )}
    </div>
  );
}
