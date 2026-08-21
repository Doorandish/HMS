/**
 * API Route: Meldeschein (Digital Guest Registration) Export
 *
 * GET /api/v1/guests/meldeschein?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Exports guest registration data for compliance reporting.
 * Required by law in Germany and several other countries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportMeldeschein } from '@/lib/services/guest-service';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';

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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required query parameters: from, to (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const data = await exportMeldeschein(tenant.id, from, to);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        from,
        to,
        totalGuests: data.length,
        exportedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API] Meldeschein export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
