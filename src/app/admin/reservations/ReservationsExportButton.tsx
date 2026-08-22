'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportReservationsCSV } from './actions';

export default function ReservationsExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');

  const handleExportCSV = async () => {
    setIsExporting(true);
    setMessage('');
    
    const res = await exportReservationsCSV();
    
    if (res.success && res.csv) {
      const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reservations-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage('Export successful!');
    } else {
      setMessage('Error: ' + res.error);
    }
    
    setIsExporting(false);
    
    if (message) {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button 
        onClick={handleExportCSV}
        disabled={isExporting}
        className="flex items-center gap-2 bg-[var(--tenant-primary)] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Export CSV (GoBD)
      </button>
      {message && (
        <span className={`text-xs ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </span>
      )}
    </div>
  );
}
