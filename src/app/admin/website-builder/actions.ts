'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

async function getTenantId() {
  const headersList = await headers();
  const slug = headersList.get('x-tenant-slug');
  if (!slug) throw new Error('Tenant not found');

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: slug },
    select: { id: true },
  });

  if (!tenant) throw new Error('Tenant not found');
  return tenant.id;
}

export async function updateTenantBranding(data: {
  name: string;
  primaryColor?: string;
  logoUrl?: string;
  heroImage?: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  try {
    const tenantId = await getTenantId();

    const brandingConfig = {
      primaryColor: data.primaryColor || '#000000',
      logoUrl: data.logoUrl || '',
      heroImage: data.heroImage || '',
    };

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        brandingConfig,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRoomType(id: string, data: {
  name: string;
  description?: string;
  category: string;
  baseOccupancy: number;
  maxOccupancy: number;
  amenities: string[];
}) {
  try {
    await prisma.roomType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        baseOccupancy: data.baseOccupancy,
        maxOccupancy: data.maxOccupancy,
        amenities: data.amenities,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
