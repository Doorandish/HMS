'use client';

import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { upsertDailyRate } from './actions';
import { X, Save, Loader2, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

type RoomType = any;
type DailyRate = any;

export default function RateGrid({ 
  roomTypes, 
  initialDailyRates, 
  startDate 
}: { 
  roomTypes: RoomType[], 
  initialDailyRates: DailyRate[], 
  startDate: Date 
}) {
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(startDate, i));
  const [rates, setRates] = useState<DailyRate[]>(initialDailyRates);

  const getRate = (roomTypeId: string, date: Date) => {
    return rates.find(
      r => r.roomTypeId === roomTypeId && new Date(r.date).getTime() === date.getTime()
    );
  };

  const [editingCell, setEditingCell] = useState<{roomTypeId: string, date: Date} | null>(null);

  const handleRateUpdate = (updatedRate: DailyRate) => {
    setRates(prev => {
      const existingIdx = prev.findIndex(r => r.id === updatedRate.id || (r.roomTypeId === updatedRate.roomTypeId && new Date(r.date).getTime() === new Date(updatedRate.date).getTime()));
      if (existingIdx >= 0) {
        const newRates = [...prev];
        newRates[existingIdx] = updatedRate;
        return newRates;
      }
      return [...prev, updatedRate];
    });
    setEditingCell(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 border-r border-gray-200 min-w-[200px]">
                Room Type
              </th>
              {dates.map((date, i) => (
                <th key={i} className="px-4 py-3 font-medium text-gray-700 min-w-[120px] text-center border-r border-gray-200">
                  <div className="text-xs text-gray-500 uppercase">{format(date, 'EEE')}</div>
                  <div className="font-semibold">{format(date, 'MMM d')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roomTypes.map(rt => (
              <tr key={rt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200">
                  {rt.name}
                </td>
                {dates.map((date, i) => {
                  const rate = getRate(rt.id, date);
                  const isEditing = editingCell?.roomTypeId === rt.id && editingCell?.date.getTime() === date.getTime();

                  return (
                    <td 
                      key={i} 
                      className={cn(
                        "p-0 border-r border-gray-200 relative align-top",
                        rate?.stopSell ? "bg-red-50" : ""
                      )}
                    >
                      {isEditing ? (
                        <RateEditor 
                          roomTypeId={rt.id}
                          date={date}
                          rate={rate}
                          onClose={() => setEditingCell(null)}
                          onSave={handleRateUpdate}
                        />
                      ) : (
                        <div 
                          className="px-4 py-3 h-full cursor-pointer hover:bg-blue-50 transition-colors flex flex-col justify-between min-h-[80px]"
                          onClick={() => setEditingCell({ roomTypeId: rt.id, date })}
                        >
                          <div className="flex justify-between items-start">
                            <span className={cn("font-semibold", rate?.stopSell ? "text-red-700" : "text-gray-900")}>
                              {rate?.price !== undefined ? `€${rate.price}` : '-'}
                            </span>
                            {rate?.stopSell && <Ban size={14} className="text-red-500" />}
                          </div>
                          <div className="text-xs text-gray-500 flex gap-2 mt-2">
                            {rate?.minStay > 1 && <span className="bg-gray-100 px-1 rounded">Min {rate.minStay}</span>}
                            {rate?.maxStay < 365 && <span className="bg-gray-100 px-1 rounded">Max {rate.maxStay}</span>}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RateEditor({ 
  roomTypeId, 
  date, 
  rate, 
  onClose, 
  onSave 
}: { 
  roomTypeId: string, 
  date: Date, 
  rate: any,
  onClose: () => void,
  onSave: (rate: any) => void
}) {
  const [data, setData] = useState({
    price: rate?.price ?? 0,
    minStay: rate?.minStay ?? 1,
    maxStay: rate?.maxStay ?? 365,
    stopSell: rate?.stopSell ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await upsertDailyRate({
      roomTypeId,
      date,
      ...data,
    });
    setSaving(false);
    if (result.success) {
      onSave({
        id: rate?.id || Math.random().toString(),
        roomTypeId,
        date,
        ...data,
      });
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="absolute inset-0 bg-white shadow-lg border border-blue-400 z-20 p-3 min-w-[200px] rounded-lg m-1">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-700">{format(date, 'MMM d, yyyy')}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
      </div>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Price (€)</label>
          <input
            type="number"
            value={data.price}
            onChange={e => setData({...data, price: parseFloat(e.target.value) || 0})}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Min Stay</label>
            <input
              type="number"
              value={data.minStay}
              onChange={e => setData({...data, minStay: parseInt(e.target.value) || 1})}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Max Stay</label>
            <input
              type="number"
              value={data.maxStay}
              onChange={e => setData({...data, maxStay: parseInt(e.target.value) || 365})}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={data.stopSell}
            onChange={e => setData({...data, stopSell: e.target.checked})}
            className="rounded text-red-600 focus:ring-red-500"
          />
          <span className="text-xs font-medium text-gray-700">Stop Sell</span>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 text-white px-2 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save
        </button>
      </form>
    </div>
  );
}
