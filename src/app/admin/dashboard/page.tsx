import React from 'react';
import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';
import { Users, LogIn, LogOut, TrendingUp, DollarSign } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';

export default async function AdminDashboardPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');
  const tenant = await resolveTenant(tenantSlug);

  if (!tenant) return <div>Tenant not found</div>;

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  // Fetch some real metrics for the dashboard
  const [arrivals, departures, inHouse, totalRooms, recentBookings] = await Promise.all([
    prisma.reservation.count({
      where: { tenantId: tenant.id, checkIn: { gte: start, lte: end } }
    }),
    prisma.reservation.count({
      where: { tenantId: tenant.id, checkOut: { gte: start, lte: end } }
    }),
    prisma.reservation.count({
      where: { 
        tenantId: tenant.id, 
        status: { in: ['CHECKED_IN', 'CONFIRMED'] },
        checkIn: { lte: end },
        checkOut: { gt: start }
      }
    }),
    prisma.room.count({
      where: { roomType: { tenantId: tenant.id } }
    }),
    prisma.reservation.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { guest: true, roomType: true }
    })
  ]);

  const occupancyRate = totalRooms > 0 ? Math.round((inHouse / totalRooms) * 100) : 0;

  const stats = [
    { title: 'Arrivals Today', value: arrivals.toString(), icon: LogIn, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Departures Today', value: departures.toString(), icon: LogOut, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'In-House Guests', value: inHouse.toString(), icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Occupancy', value: `${occupancyRate}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
            <button className="text-sm text-[var(--tenant-primary)] font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Guest</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((res) => (
                  <tr key={res.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {res.guest.firstName} {res.guest.lastName}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{res.roomType.name}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {format(res.checkIn, 'MMM d')} - {format(res.checkOut, 'MMM d')}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {res.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: res.currency }).format(res.totalAmount)}
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No recent bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Revenue Snapshot */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Today's Revenue Snapshot</h2>
          <div className="flex-1 flex flex-col justify-center items-center py-8">
            <div className="w-16 h-16 bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)] rounded-full flex items-center justify-center mb-4">
              <DollarSign size={32} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">€4,250.00</h3>
            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp size={16} /> +12.5% from yesterday
            </p>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-4">
            <button className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200">
              New Booking
            </button>
            <button className="py-2.5 px-4 bg-[var(--tenant-primary)] hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors">
              Check-in Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
