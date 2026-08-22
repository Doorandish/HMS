import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { resolveTenant } from '@/lib/tenant/tenant-resolver';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { HeroHeader } from '@/components/blocks/hero-header';
import { RoomShowcase } from '@/components/blocks/room-showcase';
import { ServicesSection } from '@/components/blocks/services-section';
import { ReviewsWidget } from '@/components/blocks/reviews-widget';
import { SchemaMarkup } from '@/components/seo/schema-markup';

export default async function HomePage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug');
  const tenant = await resolveTenant(tenantSlug);

  // Fetch active room types for this tenant
  let roomTypes: any[] = [];
  if (tenant) {
    roomTypes = await prisma.roomType.findMany({
      where: { 
        tenantId: tenant.id,
        isActive: true 
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  return (
    <>
      {tenant && <SchemaMarkup tenant={tenant as any} />}
      <SiteHeader />
      <main className="flex-grow">
        <HeroHeader />
        <RoomShowcase rooms={roomTypes as any} />
        <ServicesSection />
        <ReviewsWidget />
      </main>
      <SiteFooter />
    </>
  );
}
