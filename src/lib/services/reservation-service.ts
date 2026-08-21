/**
 * Reservation Service
 *
 * Handles reservation creation with overbooking protection,
 * availability validation, and reservation number generation.
 */

import prisma from '@/lib/db/prisma';
import { Prisma, ReservationStatus, PaymentStatus, ReservationSource } from '@prisma/client';
import type { Reservation } from '@prisma/client';

// ============================================================
// Types
// ============================================================

export interface SearchAvailabilityInput {
  tenantId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
}

export interface AvailableRoomType {
  id: string;
  name: string;
  category: string;
  description: string | null;
  baseOccupancy: number;
  maxOccupancy: number;
  amenities: unknown;
  images: unknown;
  size: number | null;
  availableRooms: number;
  ratePlans: {
    id: string;
    name: string;
    cancellationPolicy: string;
    mealPlan: string;
    totalPrice: number;
    nightlyPrices: { date: string; price: number }[];
  }[];
}

export interface CreateReservationInput {
  tenantId: string;
  guestId: string;
  roomTypeId: string;
  ratePlanId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  source: ReservationSource;
  specialRequests?: string;
  addOnIds?: { addOnId: string; quantity: number }[];
}

// ============================================================
// Availability Search
// ============================================================

/**
 * Search for available room types for a given date range.
 * Calculates real-time availability based on existing reservations
 * and the daily rates / restriction matrix.
 */
export async function searchAvailability(
  input: SearchAvailabilityInput
): Promise<AvailableRoomType[]> {
  const { tenantId, checkIn, checkOut, adults, children } = input;
  const totalGuests = adults + children;

  // Get all active room types for the tenant
  const roomTypes = await prisma.roomType.findMany({
    where: {
      tenantId,
      isActive: true,
      maxOccupancy: { gte: totalGuests },
    },
    include: {
      rooms: { where: { isActive: true } },
      ratePlans: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      dailyRates: {
        where: {
          date: {
            gte: new Date(checkIn),
            lt: new Date(checkOut),
          },
          stopSell: false,
        },
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const results: AvailableRoomType[] = [];

  for (const roomType of roomTypes) {
    const totalRooms = roomType.rooms.length;

    // Count overlapping active reservations
    const overlappingReservations = await prisma.reservation.count({
      where: {
        roomTypeId: roomType.id,
        status: {
          in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN],
        },
        checkIn: { lt: new Date(checkOut) },
        checkOut: { gt: new Date(checkIn) },
      },
    });

    const availableRooms = totalRooms - overlappingReservations;

    if (availableRooms <= 0) continue;

    // Check daily rate restrictions
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Build nightly prices from daily rates
    const nightlyPrices: { date: string; price: number }[] = [];
    let hasRestrictionBlock = false;

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkInDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dailyRate = roomType.dailyRates.find(
        (dr) => dr.date.toISOString().split('T')[0] === dateStr
      );

      if (!dailyRate) {
        // No rate configured for this date — skip this room type
        hasRestrictionBlock = true;
        break;
      }

      // Check arrival/departure restrictions
      if (i === 0 && dailyRate.closedToArrival) {
        hasRestrictionBlock = true;
        break;
      }
      if (i === nights - 1 && dailyRate.closedToDeparture) {
        hasRestrictionBlock = true;
        break;
      }

      // Check min/max stay
      if (nights < dailyRate.minStay || nights > dailyRate.maxStay) {
        hasRestrictionBlock = true;
        break;
      }

      nightlyPrices.push({ date: dateStr, price: dailyRate.price });
    }

    if (hasRestrictionBlock || nightlyPrices.length !== nights) continue;

    // Calculate total prices for each rate plan
    const ratePlanPricing = roomType.ratePlans.map((plan) => {
      const planNightlyPrices = nightlyPrices.map((np) => ({
        date: np.date,
        price: Math.round(np.price * plan.priceModifier * 100) / 100,
      }));

      return {
        id: plan.id,
        name: plan.name,
        cancellationPolicy: plan.cancellationPolicy,
        mealPlan: plan.mealPlan,
        totalPrice: planNightlyPrices.reduce((sum, np) => sum + np.price, 0),
        nightlyPrices: planNightlyPrices,
      };
    });

    if (ratePlanPricing.length === 0) continue;

    results.push({
      id: roomType.id,
      name: roomType.name,
      category: roomType.category,
      description: roomType.description,
      baseOccupancy: roomType.baseOccupancy,
      maxOccupancy: roomType.maxOccupancy,
      amenities: roomType.amenities,
      images: roomType.images,
      size: roomType.size,
      availableRooms,
      ratePlans: ratePlanPricing,
    });
  }

  return results;
}

// ============================================================
// Reservation Creation (with Overbooking Protection)
// ============================================================

/**
 * Generate a unique reservation number.
 * Format: HMS-XXXXXXXX (8 alphanumeric characters)
 */
function generateReservationNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'HMS-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a reservation with overbooking protection.
 * Uses a database transaction with SERIALIZABLE isolation level
 * to prevent race conditions during concurrent bookings.
 *
 * OVERBOOKING LOCK MECHANISM:
 * The transaction re-checks availability inside the lock
 * to prevent double-booking even under concurrent requests.
 */
export async function createReservation(
  input: CreateReservationInput
): Promise<Reservation> {
  return prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // Re-check availability within the transaction (overbooking guard)
      const totalPhysicalRooms = await tx.room.count({
        where: {
          roomTypeId: input.roomTypeId,
          isActive: true,
        },
      });

      const overlappingReservations = await tx.reservation.count({
        where: {
          roomTypeId: input.roomTypeId,
          status: {
            in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN],
          },
          checkIn: { lt: new Date(input.checkOut) },
          checkOut: { gt: new Date(input.checkIn) },
        },
      });

      if (overlappingReservations >= totalPhysicalRooms) {
        throw new Error(
          'OVERBOOKING: No rooms available for the selected dates. Please try different dates.'
        );
      }

      // Calculate pricing
      const checkInDate = new Date(input.checkIn);
      const checkOutDate = new Date(input.checkOut);
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const dailyRates = await tx.dailyRate.findMany({
        where: {
          roomTypeId: input.roomTypeId,
          date: {
            gte: checkInDate,
            lt: checkOutDate,
          },
        },
      });

      // Get rate plan modifier
      let priceModifier = 1.0;
      if (input.ratePlanId) {
        const ratePlan = await tx.ratePlan.findUnique({
          where: { id: input.ratePlanId },
        });
        if (ratePlan) priceModifier = ratePlan.priceModifier;
      }

      const subtotal = dailyRates.reduce(
        (sum, dr) => sum + dr.price * priceModifier,
        0
      );

      // Get tenant tax settings
      const tenant = await tx.tenant.findUnique({
        where: { id: input.tenantId },
      });

      const taxSettings = (tenant?.taxSettings as Record<string, number>) || {};
      const taxRate = taxSettings.lodgingVatRate || 0;
      const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;

      // Calculate add-on costs
      let addOnTotal = 0;
      const addOnData: {
        addOnId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }[] = [];

      if (input.addOnIds && input.addOnIds.length > 0) {
        const addOns = await tx.addOn.findMany({
          where: {
            id: { in: input.addOnIds.map((a) => a.addOnId) },
            tenantId: input.tenantId,
          },
        });

        for (const requested of input.addOnIds) {
          const addOn = addOns.find((a) => a.id === requested.addOnId);
          if (!addOn) continue;

          let total = addOn.price * requested.quantity;
          if (addOn.pricingType === 'PER_NIGHT') {
            total *= nights;
          } else if (addOn.pricingType === 'PER_PERSON_PER_NIGHT') {
            total *= nights * (input.adults + input.children);
          } else if (addOn.pricingType === 'PER_PERSON') {
            total *= input.adults + input.children;
          }

          addOnData.push({
            addOnId: addOn.id,
            quantity: requested.quantity,
            unitPrice: addOn.price,
            totalPrice: Math.round(total * 100) / 100,
          });

          addOnTotal += total;
        }
      }

      const totalAmount =
        Math.round((subtotal + taxAmount + addOnTotal) * 100) / 100;

      // Create the reservation
      const reservation = await tx.reservation.create({
        data: {
          tenantId: input.tenantId,
          reservationNumber: generateReservationNumber(),
          guestId: input.guestId,
          roomTypeId: input.roomTypeId,
          ratePlanId: input.ratePlanId || null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          adults: input.adults,
          children: input.children,
          status: ReservationStatus.CONFIRMED,
          source: input.source,
          subtotalAmount: Math.round(subtotal * 100) / 100,
          taxAmount,
          totalAmount,
          currency: tenant?.currency || 'EUR',
          paymentStatus: PaymentStatus.PENDING,
          specialRequests: input.specialRequests || null,
          confirmedAt: new Date(),
          addOns: {
            create: addOnData,
          },
        },
      });

      return reservation;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 10000,
    }
  );
}

// ============================================================
// Reservation Management
// ============================================================

export async function getReservation(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      guest: true,
      roomType: true,
      ratePlan: true,
      assignedRoom: true,
      addOns: { include: { addOn: true } },
      payments: true,
    },
  });
}

export async function getReservationByNumber(reservationNumber: string) {
  return prisma.reservation.findUnique({
    where: { reservationNumber },
    include: {
      guest: true,
      roomType: true,
      ratePlan: true,
      assignedRoom: true,
      addOns: { include: { addOn: true } },
      payments: true,
    },
  });
}

export async function listReservations(
  tenantId: string,
  filters?: {
    status?: ReservationStatus;
    from?: string;
    to?: string;
    source?: ReservationSource;
  }
) {
  const where: Prisma.ReservationWhereInput = { tenantId };

  if (filters?.status) where.status = filters.status;
  if (filters?.source) where.source = filters.source;
  if (filters?.from || filters?.to) {
    where.checkIn = {};
    if (filters.from) where.checkIn.gte = new Date(filters.from);
    if (filters.to) where.checkIn.lte = new Date(filters.to);
  }

  return prisma.reservation.findMany({
    where,
    include: {
      guest: true,
      roomType: true,
      ratePlan: true,
      assignedRoom: true,
    },
    orderBy: { checkIn: 'asc' },
  });
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  assignedRoomId?: string
) {
  const data: Prisma.ReservationUpdateInput = { status };

  switch (status) {
    case ReservationStatus.CHECKED_IN:
      data.checkedInAt = new Date();
      if (assignedRoomId) data.assignedRoom = { connect: { id: assignedRoomId } };
      break;
    case ReservationStatus.CHECKED_OUT:
      data.checkedOutAt = new Date();
      break;
    case ReservationStatus.CANCELLED:
      data.cancelledAt = new Date();
      break;
  }

  return prisma.reservation.update({
    where: { id },
    data,
  });
}
