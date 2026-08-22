'use client';

import React, { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { exportReservationsCSV } from './actions';

export default function ReservationsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState('');

  const handleExportCSV = async () => {
    setIsExporting(true);
    setMessage('');
    
    // In a real app we'd get the tenantId from context or let the server action read it from session
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
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[var(--tenant-primary)]" />
          <h1 className="text-3xl font-bold">Reservations</h1>
        </div>
        
        <button 
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 bg-[var(--tenant-primary)] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export CSV (GoBD)
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Reservations list will be displayed here.</p>
        {/* Reservation list would go here */}
      </div>
    </div>
  );
}
