import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Building, CalendarDays, CheckCircle, CreditCard, Mail, Phone, User, LogOut } from 'lucide-react';
import { InvoicePrintView } from './InvoicePrintView';
import { StatusActions } from './StatusActions';

export default async function ReservationFolioPage({ params }: { params: Promise<{ id: string }> }) {
  const reservationId = (await params).id;
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      guest: true,
      roomType: true,
      assignedRoom: true,
      addOns: { include: { addOn: true } },
      payments: true,
      tenant: true
    }
  });

  if (!reservation) {
    notFound();
  }

  // Calculate VAT based on seed assumption: 7% for lodging, 19% for services
  const lodgingTotal = reservation.subtotalAmount; // Simplified, assuming subtotal is only room
  const addOnsTotal = reservation.addOns.reduce((acc, a) => acc + a.totalPrice, 0);
  const lodgingVat = lodgingTotal * 0.07;
  const servicesVat = addOnsTotal * 0.19;
  
  // A more realistic calculation based on the actual model
  const totalAmount = reservation.totalAmount;
  const totalPaid = reservation.payments.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0);
  const balance = totalAmount - totalPaid;

  const fmtCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: reservation.currency }).format(val);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservation #{reservation.reservationNumber}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              reservation.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
              reservation.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' :
              reservation.status === 'CHECKED_OUT' ? 'bg-gray-200 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {reservation.status.replace('_', ' ')}
            </span>
            <span>Created on {format(reservation.createdAt, 'MMM d, yyyy')}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InvoicePrintView reservation={reservation} />
          <StatusActions reservationId={reservation.id} currentStatus={reservation.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Stay Details</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2"><CalendarDays size={16} /> Check In</p>
                <p className="font-medium mt-1">{format(reservation.checkIn, 'EEEE, MMM d, yyyy')}</p>
                <p className="text-xs text-gray-500">From {reservation.tenant.checkInTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2"><LogOut size={16} /> Check Out</p>
                <p className="font-medium mt-1">{format(reservation.checkOut, 'EEEE, MMM d, yyyy')}</p>
                <p className="text-xs text-gray-500">Until {reservation.tenant.checkOutTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2"><Building size={16} /> Room</p>
                <p className="font-medium mt-1">{reservation.roomType.name}</p>
                <p className="text-xs text-gray-500">Assigned: {reservation.assignedRoom?.roomNumber || 'None'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2"><User size={16} /> Guests</p>
                <p className="font-medium mt-1">{reservation.adults} Adults, {reservation.children} Children</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Folio & Charges</h2>
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 bg-gray-50 uppercase text-xs">
                <tr>
                  <th className="px-4 py-2 rounded-l-md">Description</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 rounded-r-md text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3">
                    <p className="font-medium">Accommodation ({reservation.roomType.name})</p>
                    <p className="text-xs text-gray-500">{format(reservation.checkIn, 'MMM d')} - {format(reservation.checkOut, 'MMM d')}</p>
                  </td>
                  <td className="px-4 py-3 text-right">1</td>
                  <td className="px-4 py-3 text-right">{fmtCurrency(lodgingTotal)}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmtCurrency(lodgingTotal)}</td>
                </tr>
                {reservation.addOns.map(ro => (
                  <tr key={ro.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{ro.addOn.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right">{ro.quantity}</td>
                    <td className="px-4 py-3 text-right">{fmtCurrency(ro.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmtCurrency(ro.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Net)</span>
                <span>{fmtCurrency(totalAmount - reservation.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>VAT Lodging (7%)</span>
                <span>{fmtCurrency(lodgingVat)}</span>
              </div>
              {servicesVat > 0 && (
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>VAT Services (19%)</span>
                  <span>{fmtCurrency(servicesVat)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total Gross</span>
                <span>{fmtCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Total Paid</span>
                <span>- {fmtCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-[var(--tenant-primary)] pt-2">
                <span>Balance Due</span>
                <span>{fmtCurrency(balance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Guest & Payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Guest Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-semibold">{reservation.guest.firstName} {reservation.guest.lastName}</p>
                  <p className="text-xs text-gray-500">Guest ID: {reservation.guest.id.slice(-6)}</p>
                </div>
              </div>
              <div className="pt-2 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-600"><Mail size={16} /> {reservation.guest.email}</p>
                {reservation.guest.phone && (
                  <p className="flex items-center gap-2 text-gray-600"><Phone size={16} /> {reservation.guest.phone}</p>
                )}
              </div>
              <button className="w-full py-2 bg-gray-50 border rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors mt-2">
                View Full Profile
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Payment History</h2>
            {reservation.payments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No payments recorded.</p>
            ) : (
              <div className="space-y-3">
                {reservation.payments.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        <CreditCard size={14} className="text-gray-400" />
                        {p.method.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">{format(p.createdAt, 'MMM d, HH:mm')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{fmtCurrency(p.amount)}</p>
                      <p className={`text-[10px] font-bold ${p.status === 'PAID' ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {p.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {balance > 0 && (
              <button className="w-full py-2 mt-4 bg-[var(--tenant-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                <CreditCard size={16} />
                Charge {fmtCurrency(balance)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
