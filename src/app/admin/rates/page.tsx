import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';
import RateGrid from './RateGrid';

async function getRatesData() {
  const headersList = await headers();
  const slug = headersList.get('x-tenant-slug');

  if (!slug) {
    return null;
  }

  const tenant = await resolveTenant(slug);
  if (!tenant) return null;

  const roomTypes = await prisma.roomType.findMany({
    where: { tenantId: tenant.id },
    orderBy: { sortOrder: 'asc' },
  });

  // Next 14 days
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 14);

  const roomTypeIds = roomTypes.map((rt) => rt.id);

  const dailyRates = await prisma.dailyRate.findMany({
    where: {
      roomTypeId: { in: roomTypeIds },
      date: {
        gte: today,
        lt: endDate,
      },
    },
  });

  return {
    roomTypes,
    dailyRates,
    startDate: today,
  };
}

export default async function RatesPage() {
  const data = await getRatesData();

  if (!data) {
    return <div>Tenant not found</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rates & Inventory</h1>
        <p className="text-gray-500 mt-2">Manage daily pricing, restrictions, and availability.</p>
      </div>
      
      <RateGrid 
        roomTypes={data.roomTypes} 
        initialDailyRates={data.dailyRates} 
        startDate={data.startDate} 
      />
    </div>
  );
}
