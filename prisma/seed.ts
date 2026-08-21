/**
 * Database Seed Script
 *
 * Creates a demo tenant with sample room types, rate plans,
 * daily rates, add-ons, and a test guest with reservation.
 *
 * Run: npx prisma db seed
 */

import { PrismaClient, RoomStatus, MealPlan, CancellationPolicy, PricingType, ReservationStatus, PaymentStatus, ReservationSource } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🏨 Seeding HMS database...\n');

  // =========================================================
  // 1. Create Demo Tenant
  // =========================================================
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Hotel Sonnenberg',
      subdomain: 'demo',
      customDomain: null,
      brandingConfig: {
        primaryColor: '#1a365d',
        secondaryColor: '#2d3748',
        accentColor: '#ed8936',
        fontFamily: 'Inter, system-ui, sans-serif',
        logoUrl: null,
        logoAlt: 'Hotel Sonnenberg',
        heroImageUrl: null,
        heroTitle: 'Welcome to Hotel Sonnenberg',
        heroSubtitle: 'Experience Alpine luxury in the heart of Bavaria',
        galleryImages: [],
        customCss: null,
      },
      email: 'info@hotel-sonnenberg.de',
      phone: '+49 89 123 4567',
      address: 'Marienplatz 12',
      city: 'Munich',
      country: 'Germany',
      postalCode: '80331',
      latitude: 48.1371,
      longitude: 11.5754,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      taxSettings: {
        lodgingVatRate: 7,       // German reduced VAT for lodging
        serviceVatRate: 19,      // Standard German VAT for F&B/services
      },
    },
  });

  console.log(`✅ Tenant created: ${tenant.name} (${tenant.subdomain})`);

  // =========================================================
  // 2. Create Room Types
  // =========================================================
  const standardSingle = await prisma.roomType.upsert({
    where: { id: 'rt_standard_single' },
    update: {},
    create: {
      id: 'rt_standard_single',
      tenantId: tenant.id,
      name: 'Standard Single Room',
      category: 'Single',
      description: 'Comfortable single room with city views. Perfect for solo travelers.',
      baseOccupancy: 1,
      maxOccupancy: 1,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Minibar', 'Hair Dryer'],
      images: [],
      size: 18,
      sortOrder: 1,
    },
  });

  const deluxeDouble = await prisma.roomType.upsert({
    where: { id: 'rt_deluxe_double' },
    update: {},
    create: {
      id: 'rt_deluxe_double',
      tenantId: tenant.id,
      name: 'Deluxe Double Room',
      category: 'Double',
      description: 'Spacious double room with premium bedding and mountain views.',
      baseOccupancy: 2,
      maxOccupancy: 3,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Minibar', 'Hair Dryer', 'Bathrobe', 'Balcony', 'Nespresso Machine'],
      images: [],
      size: 32,
      sortOrder: 2,
    },
  });

  const premiumSuite = await prisma.roomType.upsert({
    where: { id: 'rt_premium_suite' },
    update: {},
    create: {
      id: 'rt_premium_suite',
      tenantId: tenant.id,
      name: 'Premium Suite',
      category: 'Suite',
      description: 'Luxurious suite with separate living area, panoramic Alpine views, and exclusive amenities.',
      baseOccupancy: 2,
      maxOccupancy: 4,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Minibar', 'Hair Dryer', 'Bathrobe', 'Balcony', 'Nespresso Machine', 'Jacuzzi', 'Living Area', 'Dining Table', 'Welcome Champagne'],
      images: [],
      size: 55,
      sortOrder: 3,
    },
  });

  console.log(`✅ Room Types created: ${standardSingle.name}, ${deluxeDouble.name}, ${premiumSuite.name}`);

  // =========================================================
  // 3. Create Physical Rooms
  // =========================================================
  const roomData = [
    // Standard Single - 5 rooms
    { roomTypeId: standardSingle.id, roomNumber: '101', floor: 1, status: RoomStatus.CLEAN },
    { roomTypeId: standardSingle.id, roomNumber: '102', floor: 1, status: RoomStatus.CLEAN },
    { roomTypeId: standardSingle.id, roomNumber: '103', floor: 1, status: RoomStatus.INSPECTED },
    { roomTypeId: standardSingle.id, roomNumber: '201', floor: 2, status: RoomStatus.DIRTY },
    { roomTypeId: standardSingle.id, roomNumber: '202', floor: 2, status: RoomStatus.CLEAN },
    // Deluxe Double - 4 rooms
    { roomTypeId: deluxeDouble.id, roomNumber: '301', floor: 3, status: RoomStatus.CLEAN },
    { roomTypeId: deluxeDouble.id, roomNumber: '302', floor: 3, status: RoomStatus.INSPECTED },
    { roomTypeId: deluxeDouble.id, roomNumber: '303', floor: 3, status: RoomStatus.CLEAN },
    { roomTypeId: deluxeDouble.id, roomNumber: '304', floor: 3, status: RoomStatus.OUT_OF_SERVICE },
    // Premium Suite - 2 rooms
    { roomTypeId: premiumSuite.id, roomNumber: '401', floor: 4, status: RoomStatus.INSPECTED },
    { roomTypeId: premiumSuite.id, roomNumber: '402', floor: 4, status: RoomStatus.CLEAN },
  ];

  for (const room of roomData) {
    await prisma.room.upsert({
      where: {
        roomTypeId_roomNumber: {
          roomTypeId: room.roomTypeId,
          roomNumber: room.roomNumber,
        },
      },
      update: {},
      create: room,
    });
  }

  console.log(`✅ Physical Rooms created: ${roomData.length} rooms`);

  // =========================================================
  // 4. Create Rate Plans
  // =========================================================
  const ratePlansData = [
    // Standard Single rate plans
    { id: 'rp_single_standard', tenantId: tenant.id, roomTypeId: standardSingle.id, name: 'Flexible Rate', cancellationPolicy: CancellationPolicy.FREE_CANCELLATION, mealPlan: MealPlan.ROOM_ONLY, priceModifier: 1.0, sortOrder: 1 },
    { id: 'rp_single_bb', tenantId: tenant.id, roomTypeId: standardSingle.id, name: 'Bed & Breakfast', cancellationPolicy: CancellationPolicy.MODERATE, mealPlan: MealPlan.BED_AND_BREAKFAST, priceModifier: 1.15, sortOrder: 2 },
    { id: 'rp_single_nonref', tenantId: tenant.id, roomTypeId: standardSingle.id, name: 'Non-Refundable Saver', cancellationPolicy: CancellationPolicy.NON_REFUNDABLE, mealPlan: MealPlan.ROOM_ONLY, priceModifier: 0.85, sortOrder: 3 },
    // Deluxe Double rate plans
    { id: 'rp_double_standard', tenantId: tenant.id, roomTypeId: deluxeDouble.id, name: 'Flexible Rate', cancellationPolicy: CancellationPolicy.FREE_CANCELLATION, mealPlan: MealPlan.ROOM_ONLY, priceModifier: 1.0, sortOrder: 1 },
    { id: 'rp_double_bb', tenantId: tenant.id, roomTypeId: deluxeDouble.id, name: 'Bed & Breakfast', cancellationPolicy: CancellationPolicy.MODERATE, mealPlan: MealPlan.BED_AND_BREAKFAST, priceModifier: 1.12, sortOrder: 2 },
    { id: 'rp_double_hb', tenantId: tenant.id, roomTypeId: deluxeDouble.id, name: 'Half Board', cancellationPolicy: CancellationPolicy.STRICT, mealPlan: MealPlan.HALF_BOARD, priceModifier: 1.30, sortOrder: 3 },
    // Premium Suite rate plans
    { id: 'rp_suite_standard', tenantId: tenant.id, roomTypeId: premiumSuite.id, name: 'Flexible Rate', cancellationPolicy: CancellationPolicy.FREE_CANCELLATION, mealPlan: MealPlan.ROOM_ONLY, priceModifier: 1.0, sortOrder: 1 },
    { id: 'rp_suite_allincl', tenantId: tenant.id, roomTypeId: premiumSuite.id, name: 'All Inclusive Luxury', cancellationPolicy: CancellationPolicy.MODERATE, mealPlan: MealPlan.ALL_INCLUSIVE, priceModifier: 1.45, sortOrder: 2 },
  ];

  for (const rp of ratePlansData) {
    await prisma.ratePlan.upsert({
      where: { id: rp.id },
      update: {},
      create: rp,
    });
  }

  console.log(`✅ Rate Plans created: ${ratePlansData.length} plans`);

  // =========================================================
  // 5. Create Daily Rates (next 90 days)
  // =========================================================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const basePrices: Record<string, number> = {
    [standardSingle.id]: 89,
    [deluxeDouble.id]: 149,
    [premiumSuite.id]: 299,
  };

  const roomCounts: Record<string, number> = {
    [standardSingle.id]: 5,
    [deluxeDouble.id]: 4,
    [premiumSuite.id]: 2,
  };

  for (const roomType of [standardSingle, deluxeDouble, premiumSuite]) {
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

      // Weekend surcharge: +20%
      const basePrice = basePrices[roomType.id];
      const price = isWeekend
        ? Math.round(basePrice * 1.2 * 100) / 100
        : basePrice;

      await prisma.dailyRate.upsert({
        where: {
          roomTypeId_date: {
            roomTypeId: roomType.id,
            date: date,
          },
        },
        update: { price, availableCount: roomCounts[roomType.id] },
        create: {
          roomTypeId: roomType.id,
          date: date,
          price,
          availableCount: roomCounts[roomType.id],
          minStay: 1,
          maxStay: 30,
          closedToArrival: false,
          closedToDeparture: false,
          stopSell: false,
        },
      });
    }
  }

  console.log(`✅ Daily Rates created: 90 days × 3 room types`);

  // =========================================================
  // 6. Create Add-Ons
  // =========================================================
  const addOnsData = [
    { id: 'addon_breakfast', tenantId: tenant.id, name: 'Breakfast Buffet', description: 'Full continental breakfast with local specialties', price: 18.00, pricingType: PricingType.PER_PERSON_PER_NIGHT, sortOrder: 1 },
    { id: 'addon_parking', tenantId: tenant.id, name: 'Parking', description: 'Secure underground parking', price: 15.00, pricingType: PricingType.PER_NIGHT, sortOrder: 2 },
    { id: 'addon_airport', tenantId: tenant.id, name: 'Airport Transfer', description: 'Private transfer from/to Munich Airport (MUC)', price: 65.00, pricingType: PricingType.PER_STAY, sortOrder: 3 },
    { id: 'addon_late_checkout', tenantId: tenant.id, name: 'Late Check-out', description: 'Extend your stay until 14:00', price: 35.00, pricingType: PricingType.PER_STAY, sortOrder: 4 },
    { id: 'addon_pet', tenantId: tenant.id, name: 'Pet Fee', description: 'Your furry friend is welcome!', price: 25.00, pricingType: PricingType.PER_NIGHT, sortOrder: 5 },
    { id: 'addon_spa', tenantId: tenant.id, name: 'Spa Access', description: 'Unlimited access to spa & wellness area', price: 30.00, pricingType: PricingType.PER_PERSON_PER_NIGHT, sortOrder: 6 },
  ];

  for (const addon of addOnsData) {
    await prisma.addOn.upsert({
      where: { id: addon.id },
      update: {},
      create: addon,
    });
  }

  console.log(`✅ Add-Ons created: ${addOnsData.length} extras`);

  // =========================================================
  // 7. Create Demo Staff User
  // =========================================================
  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@hotel-sonnenberg.de',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@hotel-sonnenberg.de',
      passwordHash: '$2b$10$placeholder_hash_replace_with_real_hash',
      firstName: 'Max',
      lastName: 'Müller',
      role: 'OWNER',
    },
  });

  console.log(`✅ Demo user created: admin@hotel-sonnenberg.de`);

  // =========================================================
  // 8. Create Demo Guest & Reservation
  // =========================================================
  const guest = await prisma.guestProfile.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'anna.schmidt@example.com',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      firstName: 'Anna',
      lastName: 'Schmidt',
      email: 'anna.schmidt@example.com',
      phone: '+49 151 234 5678',
      gdprConsent: true,
      gdprConsentDate: new Date(),
    },
  });

  const checkIn = new Date(today);
  checkIn.setDate(checkIn.getDate() + 3);
  const checkOut = new Date(today);
  checkOut.setDate(checkOut.getDate() + 6);

  await prisma.reservation.upsert({
    where: { reservationNumber: 'HMS-DEMO0001' },
    update: {},
    create: {
      tenantId: tenant.id,
      reservationNumber: 'HMS-DEMO0001',
      guestId: guest.id,
      roomTypeId: deluxeDouble.id,
      ratePlanId: 'rp_double_bb',
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      status: ReservationStatus.CONFIRMED,
      source: ReservationSource.DIRECT_WEBSITE,
      subtotalAmount: 447,
      taxAmount: 31.29,
      totalAmount: 478.29,
      currency: 'EUR',
      paymentStatus: PaymentStatus.PAID,
      specialRequests: 'High floor room preferred, celebrating anniversary',
      confirmedAt: new Date(),
    },
  });

  console.log(`✅ Demo reservation created: HMS-DEMO0001`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
