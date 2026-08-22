import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ReservationStatus, ReservationSource, PaymentStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the inbound request (e.g. Bearer token provided by Channex)
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CHANNEX_WEBHOOK_SECRET}`) {
      console.warn('[ChannelManager] Unauthorized webhook attempt');
      // Return 200 to mock in dev if secret not set, else 401
      if (process.env.CHANNEX_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const payload = await req.json();
    
    // Minimal example of handling a booking created on an OTA (e.g., Booking.com)
    // Payload structure depends on the specific Channel Manager (e.g., Channex payload)
    if (payload.event === 'booking.created') {
      const { booking, property_id } = payload.data;
      
      // Find the tenant matching the property_id
      const tenant = await prisma.tenant.findFirst({
        where: { id: property_id } // In a real scenario, this might map to a channex_property_id
      });

      if (!tenant) throw new Error('Tenant mapping not found for property_id');

      // 1. Guest Profile
      const guest = await prisma.guestProfile.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: booking.customer.email } },
        update: {
          firstName: booking.customer.name,
          lastName: booking.customer.surname,
          phone: booking.customer.phone
        },
        create: {
          tenantId: tenant.id,
          email: booking.customer.email,
          firstName: booking.customer.name,
          lastName: booking.customer.surname,
          phone: booking.customer.phone
        }
      });

      // 2. Overbooking Protection / Transaction Simulation
      const checkIn = new Date(booking.arrival_date);
      const checkOut = new Date(booking.departure_date);
      
      // In a real system, you'd match the OTA room code to your internal roomTypeId
      const roomType = await prisma.roomType.findFirst({ where: { tenantId: tenant.id }});
      if (!roomType) throw new Error('RoomType mapping failed');

      // Check capacity manually (Application-level lock)
      const reservationsCount = await prisma.reservation.count({
        where: {
          roomTypeId: roomType.id,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn }
        }
      });

      // Normally we'd compare reservationsCount to roomType.rooms.length (available physical rooms)
      // For now, assume it's created successfully and mapped to an unassigned room.
      
      await prisma.reservation.create({
        data: {
          tenantId: tenant.id,
          reservationNumber: booking.booking_id,
          guestId: guest.id,
          roomTypeId: roomType.id,
          checkIn,
          checkOut,
          adults: booking.occupancy.adults,
          children: booking.occupancy.children,
          status: ReservationStatus.CONFIRMED,
          source: ReservationSource.CHANNEL_MANAGER,
          paymentStatus: booking.payment_status === 'paid' ? PaymentStatus.PAID : PaymentStatus.PENDING,
          subtotalAmount: parseFloat(booking.amount),
          totalAmount: parseFloat(booking.amount),
          currency: booking.currency || 'EUR'
        }
      });

      console.log(`[ChannelManager] Synced booking ${booking.booking_id} from ${booking.channel_name}`);
    }

    // Acknowledge receipt immediately to avoid CM retries
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ChannelManager Webhook] Error:', error);
    // Return 200 even on error sometimes to prevent infinite retries from poorly configured OTAs,
    // but log it to a DLQ (Dead Letter Queue) in production.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
