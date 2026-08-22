import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';

export async function GET(request: NextRequest) {
  try {
    const tenantSlug = request.headers.get('x-tenant-slug');
    const tenant = await resolveTenant(tenantSlug || 'demo');

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const addOns = await prisma.addOn.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: addOns,
    });
  } catch (error) {
    console.error('[API] Add-ons fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
