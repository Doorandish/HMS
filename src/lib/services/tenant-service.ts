import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import type { Tenant } from '@prisma/client';
import { invalidateTenantCache } from '@/lib/tenant/tenant-resolver';

/**
 * Service layer for Tenant CRUD operations.
 * Used by the PMS dashboard for managing property settings.
 */

export interface CreateTenantInput {
  name: string;
  subdomain: string;
  customDomain?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  currency?: string;
  timezone?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface UpdateTenantInput {
  name?: string;
  customDomain?: string;
  brandingConfig?: Prisma.InputJsonValue;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  currency?: string;
  timezone?: string;
  checkInTime?: string;
  checkOutTime?: string;
  cancellationText?: string;
  termsUrl?: string;
  privacyUrl?: string;
  impressumUrl?: string;
  taxSettings?: Prisma.InputJsonValue;
}

export async function createTenant(
  input: CreateTenantInput
): Promise<Tenant> {
  return prisma.tenant.create({
    data: {
      name: input.name,
      subdomain: input.subdomain.toLowerCase(),
      customDomain: input.customDomain || null,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      city: input.city || null,
      country: input.country || null,
      postalCode: input.postalCode || null,
      currency: input.currency || 'EUR',
      timezone: input.timezone || 'Europe/Berlin',
      checkInTime: input.checkInTime || '15:00',
      checkOutTime: input.checkOutTime || '11:00',
    },
  });
}

export async function updateTenant(
  tenantId: string,
  input: UpdateTenantInput
): Promise<Tenant> {
  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: input,
  });

  // Invalidate cache so changes take effect immediately
  invalidateTenantCache(updated.subdomain);

  return updated;
}

export async function getTenantWithRoomTypes(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      roomTypes: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          rooms: true,
          ratePlans: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      addOns: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

export async function listTenants() {
  return prisma.tenant.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}
