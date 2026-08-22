import React from 'react';
import { Users } from 'lucide-react';
import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';

export default async function GuestsPage() {
  const headersList = await headers();
  const slug = headersList.get('x-tenant-slug');
  const tenant = await resolveTenant(slug);

  if (!tenant) return <div>Tenant not found</div>;

  const guests = await prisma.guestProfile.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
    include: {
      reservations: {
        select: { id: true, checkIn: true, checkOut: true, status: true, totalAmount: true }
      }
    }
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-[var(--tenant-primary)]" />
        <h1 className="text-3xl font-bold">Guest Directory</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Total Bookings</th>
              <th className="px-4 py-3">VIP Status</th>
              <th className="px-4 py-3 rounded-r-lg text-right">Lifetime Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guests.map((guest: any) => {
              const totalSpent = guest.reservations.reduce((sum: number, res: any) => sum + res.totalAmount, 0);
              return (
                <tr key={guest.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{guest.firstName} {guest.lastName}</div>
                    <div className="text-xs text-gray-500">Added: {new Date(guest.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-900">{guest.email}</div>
                    <div className="text-xs text-gray-500">{guest.phone || '-'}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{guest.language}</td>
                  <td className="px-4 py-4 text-gray-600">{guest.reservations.length}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      guest.isVip ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {guest.isVip ? 'VIP' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-green-700">
                    €{totalSpent.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            {guests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No guests found in directory.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
