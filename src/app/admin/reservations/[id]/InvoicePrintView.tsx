'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';

export function InvoicePrintView({ reservation }: { reservation: any }) {
  const handlePrint = () => {
    // In a real app, this would open a printable window or generate a PDF.
    // For now, we just trigger the browser print dialog.
    window.print();
  };

  return (
    <>
      {/* Hidden printable area that only shows when printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-invoice, #print-invoice * { visibility: visible; }
          #print-invoice { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        }
      `}} />

      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 border bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
      >
        <Printer size={16} />
        Print Invoice
      </button>

      {/* The Invoice content to print */}
      <div id="print-invoice" className="hidden">
        <div className="max-w-4xl mx-auto p-8 bg-white text-black">
          <div className="flex justify-between items-start border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{reservation.tenant.name}</h1>
              <p>{reservation.tenant.address}, {reservation.tenant.city}</p>
              <p>{reservation.tenant.email} | {reservation.tenant.phone}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-500 uppercase">Invoice</h2>
              <p className="font-semibold">#{reservation.reservationNumber}</p>
              <p>Date: {format(new Date(), 'MMM d, yyyy')}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-bold border-b pb-1 mb-2">Billed To</h3>
            <p>{reservation.guest.firstName} {reservation.guest.lastName}</p>
            <p>{reservation.guest.email}</p>
          </div>

          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">
                  Accommodation ({reservation.roomType.name}) <br/>
                  <span className="text-sm text-gray-600">{format(reservation.checkIn, 'MMM d')} - {format(reservation.checkOut, 'MMM d')}</span>
                </td>
                <td className="py-3 text-right">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: reservation.currency }).format(reservation.subtotalAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between font-bold border-t-2 border-black pt-2">
                <span>Total Due</span>
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: reservation.currency }).format(reservation.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
