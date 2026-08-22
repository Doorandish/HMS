/**
 * API Route: Reservations
 *
 * POST /api/v1/reservations — Create a new reservation
 * GET  /api/v1/reservations — List reservations (with filters)
 *
 * Booking engine and PMS dashboard use this endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createReservation,
  listReservations,
} from '@/lib/services/reservation-service';
import { findOrCreateGuest } from '@/lib/services/guest-service';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';
import { ReservationSource, ReservationStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const tenantSlug = request.headers.get('x-tenant-slug');
    const tenant = await resolveTenant(tenantSlug);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      guest: guestData,
      roomTypeId,
      ratePlanId,
      checkIn,
      checkOut,
      adults,
      children,
      specialRequests,
      addOns,
      gdprConsent,
    } = body;

    // Validate required fields
    if (
      !guestData?.firstName ||
      !guestData?.lastName ||
      !guestData?.email ||
      !roomTypeId ||
      !checkIn ||
      !checkOut ||
      adults === undefined
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: guest (firstName, lastName, email), roomTypeId, checkIn, checkOut, adults',
        },
        { status: 400 }
      );
    }

    if (!gdprConsent) {
      return NextResponse.json(
        { error: 'GDPR consent is required to make a booking' },
        { status: 400 }
      );
    }

    // Find or create guest profile
    const guest = await findOrCreateGuest({
      tenantId: tenant.id,
      firstName: guestData.firstName,
      lastName: guestData.lastName,
      email: guestData.email,
      phone: guestData.phone,
      gdprConsent: true,
    });

    // Create reservation with overbooking protection
    const reservation = await createReservation({
      tenantId: tenant.id,
      guestId: guest.id,
      roomTypeId,
      ratePlanId,
      checkIn,
      checkOut,
      adults: Number(adults),
      children: Number(children) || 0,
      source: ReservationSource.DIRECT_WEBSITE,
      specialRequests,
      addOnIds: addOns,
    });

    // Import stripe (lazy load to avoid errors if not configured)
    const Stripe = require('stripe');
    const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-07-29.dahlia' }) : null;

    let checkoutUrl = null;

    if (stripe && (body.paymentMethod === 'stripe_cc' || body.paymentMethod === 'apple_pay')) {
      const origin = request.headers.get('origin') || `https://${tenant.subdomain}.hms.com`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: guestData.email,
        line_items: [
          {
            price_data: {
              currency: reservation.currency.toLowerCase(),
              product_data: {
                name: `Reservation #${reservation.reservationNumber}`,
                description: `${adults} Adults, ${children} Children for ${reservation.roomTypeId}`,
              },
              unit_amount: Math.round(reservation.totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/book/confirmation?resNumber=${reservation.reservationNumber}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/book?error=payment_cancelled`,
        metadata: {
          reservationId: reservation.id,
          tenantId: tenant.id
        }
      });
      
      checkoutUrl = session.url;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          reservationNumber: reservation.reservationNumber,
          id: reservation.id,
          status: reservation.status,
          totalAmount: reservation.totalAmount,
          currency: reservation.currency,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          checkoutUrl: checkoutUrl
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('OVERBOOKING')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('[API] Reservation creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = request.headers.get('x-tenant-slug');
    const tenant = await resolveTenant(tenantSlug);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') as ReservationStatus | null;
    const source = searchParams.get('source') as ReservationSource | null;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const reservations = await listReservations(tenant.id, {
      status: status || undefined,
      source: source || undefined,
      from: from || undefined,
      to: to || undefined,
    });

    return NextResponse.json({
      success: true,
      data: reservations,
      meta: {
        total: reservations.length,
      },
    });
  } catch (error) {
    console.error('[API] Reservations list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
