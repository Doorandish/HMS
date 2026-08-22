'use client';

import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { createManualReservation } from './actions';
import { X } from 'lucide-react';

export function NewReservationModal({
  isOpen,
  onClose,
  defaultDate,
  room,
  tenantId
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: Date;
  room: any;
  tenantId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nights, setNights] = useState(1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const checkOut = addDays(defaultDate, nights);
    formData.append('checkIn', defaultDate.toISOString());
    formData.append('checkOut', checkOut.toISOString());
    formData.append('roomId', room.id);
    formData.append('roomTypeId', room.roomTypeId);
    formData.append('tenantId', tenantId);

    const res = await createManualReservation(formData);
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">New Reservation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
          
          <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 space-y-1">
            <p><strong>Room:</strong> {room.roomType.name} (Room {room.roomNumber})</p>
            <p><strong>Check-in:</strong> {format(defaultDate, 'MMM d, yyyy')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" name="firstName" required className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" name="lastName" required className="w-full border rounded-lg p-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" required className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nights</label>
              <input 
                type="number" 
                min="1" 
                value={nights}
                onChange={(e) => setNights(parseInt(e.target.value) || 1)}
                className="w-full border rounded-lg p-2 text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Price (€)</label>
              <input type="number" step="0.01" name="price" required className="w-full border rounded-lg p-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select name="paymentStatus" className="w-full border rounded-lg p-2 text-sm">
              <option value="UNPAID">Unpaid (Pay at Desk)</option>
              <option value="PAID">Paid (Cash/Terminal)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[var(--tenant-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
