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

    let addOns = await prisma.addOn.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (addOns.length === 0) {
      const defaultAddons = [
        { name: 'Gourmet Breakfast Buffet', description: 'Fresh pastries, local cheeses, organic eggs, artisan coffee, and seasonal fruit every morning.', price: 18.00, pricingType: 'PER_PERSON_PER_NIGHT' },
        { name: 'Secure Underground Parking', description: 'Reserved heated underground parking space with 24/7 camera surveillance and EV charging.', price: 15.00, pricingType: 'PER_NIGHT' },
        { name: 'Private Airport Transfer', description: 'Chauffeured Mercedes-Benz direct pickup or drop-off between the hotel and the airport.', price: 65.00, pricingType: 'PER_STAY' },
        { name: 'Guaranteed Late Check-Out (2:00 PM)', description: 'Relax and sleep in with extended room access until 2:00 PM on departure day.', price: 35.00, pricingType: 'PER_STAY' },
        { name: 'Thermal Spa & Sauna Pass', description: 'Unlimited access to the alpine wellness oasis, heated panoramic pool, saunas, and relaxation lounge.', price: 30.00, pricingType: 'PER_PERSON_PER_NIGHT' },
      ];

      for (const addon of defaultAddons) {
        await prisma.addOn.create({
          data: {
            tenantId: tenant.id,
            name: addon.name,
            description: addon.description,
            price: addon.price,
            pricingType: addon.pricingType as any,
          }
        });
      }

      addOns = await prisma.addOn.findMany({
        where: {
          tenantId: tenant.id,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
      });
    }

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
