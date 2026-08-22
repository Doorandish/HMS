import React from 'react';
import { FileText } from 'lucide-react';
import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';
import ReservationsExportButton from './ReservationsExportButton';

export default async function ReservationsPage() {
  const headersList = await headers();
  const slug = headersList.get('x-tenant-slug');
  const tenant = await resolveTenant(slug);

  if (!tenant) return <div>Tenant not found</div>;

  const reservations = await prisma.reservation.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
    include: {
      guest: true,
      roomType: true,
    }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[var(--tenant-primary)]" />
          <h1 className="text-3xl font-bold">Reservations</h1>
        </div>
        <ReservationsExportButton />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Res #</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Room Type</th>
              <th className="px-4 py-3">Check In / Out</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-r-lg text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations.map((res: any) => (
              <tr key={res.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-4 font-mono font-medium text-gray-900">{res.reservationNumber}</td>
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{res.guest.firstName} {res.guest.lastName}</div>
                  <div className="text-xs text-gray-500">{res.guest.email}</div>
                </td>
                <td className="px-4 py-4 text-gray-600">{res.roomType.name}</td>
                <td className="px-4 py-4 text-gray-600">
                  <div className="whitespace-nowrap">{new Date(res.checkIn).toLocaleDateString()} &rarr;</div>
                  <div className="whitespace-nowrap">{new Date(res.checkOut).toLocaleDateString()}</div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    res.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    res.status === 'CHECKED_IN' ? 'bg-green-100 text-green-800' :
                    res.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {res.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right font-medium text-gray-900">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: res.currency }).format(res.totalAmount)}
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No reservations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
