/**
 * API Route: Search Availability
 *
 * POST /api/v1/availability/search
 *
 * Searches for available room types based on date range and occupancy.
 * This endpoint is used by the booking engine for real-time availability.
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAvailability } from '@/lib/services/reservation-service';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';

export async function POST(request: NextRequest) {
  try {
    // Resolve tenant from middleware headers
    const tenantSlug = request.headers.get('x-tenant-slug');
    const tenant = await resolveTenant(tenantSlug);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { checkIn, checkOut, adults, children } = body;

    // Validate required fields
    if (!checkIn || !checkOut || adults === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: checkIn, checkOut, adults' },
        { status: 400 }
      );
    }

    // Validate date range
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'Check-out must be after check-in' },
        { status: 400 }
      );
    }

    if (checkInDate < new Date(new Date().toISOString().split('T')[0])) {
      return NextResponse.json(
        { error: 'Check-in cannot be in the past' },
        { status: 400 }
      );
    }

    const results = await searchAvailability({
      tenantId: tenant.id,
      checkIn,
      checkOut,
      adults: Number(adults),
      children: Number(children) || 0,
    });

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        checkIn,
        checkOut,
        adults,
        children: children || 0,
        currency: tenant.currency,
      },
    });
  } catch (error) {
    console.error('[API] Availability search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
