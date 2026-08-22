/**
 * Guest Profile Service
 *
 * Manages guest profiles with GDPR compliance,
 * digital registration (Meldeschein), and data encryption hooks.
 */

import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import type { GuestProfile } from '@prisma/client';

// ============================================================
// Types
// ============================================================

export interface CreateGuestInput {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  gdprConsent: boolean;
}

export interface UpdateGuestInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  notes?: string;
}

export interface MeldescheinData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  documentIssuingCountry: string;
  arrivalDate: string;
  departureDate: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// ============================================================
// Guest CRUD Operations
// ============================================================

/**
 * Find or create a guest profile.
 * If a guest with the same email exists for this tenant, return existing.
 * This prevents duplicate guest profiles from repeated bookings.
 */
export async function findOrCreateGuest(
  input: CreateGuestInput
): Promise<GuestProfile> {
  const existing = await prisma.guestProfile.findUnique({
    where: {
      tenantId_email: {
        tenantId: input.tenantId,
        email: input.email.toLowerCase(),
      },
    },
  });

  if (existing) {
    // Update name and phone if they've changed
    return prisma.guestProfile.update({
      where: { id: existing.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || existing.phone,
        gdprConsent: input.gdprConsent,
        gdprConsentDate: input.gdprConsent ? new Date() : existing.gdprConsentDate,
      },
    });
  }

  return prisma.guestProfile.create({
    data: {
      tenantId: input.tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      nationality: input.nationality || null,
      gdprConsent: input.gdprConsent,
      gdprConsentDate: input.gdprConsent ? new Date() : null,
    },
  });
}

export async function getGuest(id: string) {
  return prisma.guestProfile.findUnique({
    where: { id },
    include: {
      reservations: {
        include: { roomType: true },
        orderBy: { checkIn: 'desc' },
      },
    },
  });
}

export async function updateGuest(
  id: string,
  input: UpdateGuestInput
): Promise<GuestProfile> {
  return prisma.guestProfile.update({
    where: { id },
    data: {
      ...input,
      dateOfBirth: input.dateOfBirth
        ? new Date(input.dateOfBirth)
        : undefined,
    },
  });
}

export async function searchGuests(
  tenantId: string,
  query: string
) {
  return prisma.guestProfile.findMany({
    where: {
      tenantId,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as Prisma.QueryMode } },
        { lastName: { contains: query, mode: 'insensitive' as Prisma.QueryMode } },
        { email: { contains: query, mode: 'insensitive' as Prisma.QueryMode } },
      ],
    },
    orderBy: { lastName: 'asc' },
    take: 20,
  });
}

// ============================================================
// Digital Registration (Meldeschein)
// ============================================================

/**
 * Stores Meldeschein (guest registration) data.
 * This is required by law in Germany and several other countries.
 *
 * The data is stored as JSON and can be exported for compliance.
 *
 * HOOK POINT: Identity document encryption should be implemented
 * using a proper encryption service (e.g., AWS KMS, Vault).
 */
export async function saveMeldeschein(
  guestId: string,
  data: MeldescheinData
): Promise<GuestProfile> {
  return prisma.guestProfile.update({
    where: { id: guestId },
    data: {
      meldescheinData: data as unknown as Prisma.JsonObject,
      // TODO: Encrypt identity document data
      // identityDocEncrypted: await encryptionService.encrypt(
      //   JSON.stringify({ type: data.documentType, number: data.documentNumber })
      // ),
    },
  });
}

/**
 * Export Meldeschein data for a date range.
 * Used for compliance reporting to local authorities.
 */
export async function exportMeldeschein(
  tenantId: string,
  fromDate: string,
  toDate: string
) {
  const guests = await prisma.guestProfile.findMany({
    where: {
      tenantId,
      meldescheinData: { not: null },
      reservations: {
        some: {
          checkIn: { gte: new Date(fromDate) },
          checkOut: { lte: new Date(toDate) },
          status: { in: ['CHECKED_IN', 'CHECKED_OUT'] },
        },
      },
    },
    include: {
      reservations: {
        where: {
          checkIn: { gte: new Date(fromDate) },
          checkOut: { lte: new Date(toDate) },
        },
        include: { roomType: true, assignedRoom: true },
      },
    },
  });

  return guests.map((guest: typeof guests[number]) => ({
    guestId: guest.id,
    meldescheinData: guest.meldescheinData,
    reservations: (guest as unknown as { reservations: Array<{ reservationNumber: string; checkIn: Date; checkOut: Date; assignedRoom?: { roomNumber: string } | null; roomType: { name: string } }> }).reservations.map((r) => ({
      reservationNumber: r.reservationNumber,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      roomNumber: r.assignedRoom?.roomNumber,
      roomType: r.roomType.name,
    })),
  }));
}
