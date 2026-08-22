'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users } from 'lucide-react';
import { format, addDays } from 'date-fns';

export function BookingSearchBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      adults: adults.toString(),
      children: children.toString(),
    });
    router.push(`/book?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-2xl max-w-4xl mx-auto -mt-16 relative z-20 border border-gray-100">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
        {/* Dates */}
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1">Check-in</label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50">
              <Calendar size={18} className="text-[var(--tenant-primary)]" />
              <input 
                type="date" 
                value={format(checkIn, 'yyyy-MM-dd')}
                onChange={(e) => setCheckIn(new Date(e.target.value))}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                required
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1">Check-out</label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50">
              <Calendar size={18} className="text-[var(--tenant-primary)]" />
              <input 
                type="date" 
                value={format(checkOut, 'yyyy-MM-dd')}
                onChange={(e) => setCheckOut(new Date(e.target.value))}
                min={format(addDays(checkIn, 1), 'yyyy-MM-dd')}
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                required
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1">Adults</label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50">
              <Users size={18} className="text-[var(--tenant-primary)]" />
              <select 
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-sm w-full font-medium appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1">Children</label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50">
              <Users size={18} className="text-[var(--tenant-primary)]" />
              <select 
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="bg-transparent border-none outline-none text-sm w-full font-medium appearance-none"
              >
                {[0, 1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Child' : 'Children'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="w-full md:w-auto self-end mt-4 md:mt-0">
          <button 
            type="submit"
            className="w-full md:w-auto h-[62px] px-8 bg-[var(--tenant-accent)] hover:opacity-90 text-white font-bold rounded-md transition-all shadow-md active:scale-95"
          >
            Check Availability
          </button>
        </div>
      </form>
    </div>
  );
}
