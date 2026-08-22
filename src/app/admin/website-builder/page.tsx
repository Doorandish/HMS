import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import WebsiteBuilderClient from './WebsiteBuilderClient';

async function getTenantData() {
  const headersList = await headers();
  const slug = headersList.get('x-tenant-slug');

  if (!slug) {
    return null;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: slug },
    include: {
      roomTypes: true,
    },
  });

  return tenant;
}

export default async function WebsiteBuilderPage() {
  const tenant = await getTenantData();

  if (!tenant) {
    return <div>Tenant not found</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Website Builder</h1>
      <WebsiteBuilderClient tenant={tenant} />
    </div>
  );
}
