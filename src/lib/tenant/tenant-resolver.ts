import prisma from '@/lib/db/prisma';
import type { Tenant } from '@prisma/client';

/**
 * In-memory tenant cache with TTL.
 * In production, replace with Redis or similar distributed cache.
 */
const tenantCache = new Map<
  string,
  { tenant: Tenant; expiresAt: number }
>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Resolves a Tenant record from the database based on
 * the slug extracted by the middleware.
 *
 * @param slug - Either a subdomain string or "domain:<hostname>" for custom domains
 */
export async function resolveTenant(
  slug: string | null
): Promise<Tenant | null> {
  if (!slug) return null;

  // Check cache first
  const cached = tenantCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tenant;
  }

  let tenant: Tenant | null = null;

  try {
    if (slug.startsWith('domain:')) {
      // Custom domain lookup
      const domain = slug.replace('domain:', '');
      tenant = await prisma.tenant.findUnique({
        where: { customDomain: domain },
      });
    } else {
      // Subdomain lookup
      tenant = await prisma.tenant.findUnique({
        where: { subdomain: slug },
      });
    }

    // Cache the result (even null to avoid repeated DB misses)
    if (tenant) {
      tenantCache.set(slug, {
        tenant,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }
  } catch (error) {
    console.error('[TenantResolver] Error resolving tenant:', error);
  }

  return tenant;
}

/**
 * Invalidates the tenant cache for a given slug.
 * Call this when tenant settings are updated.
 */
export function invalidateTenantCache(slug: string): void {
  tenantCache.delete(slug);
  // Also clear any domain: prefixed entries for this tenant
  for (const [key] of tenantCache) {
    if (key.startsWith('domain:')) {
      tenantCache.delete(key);
    }
  }
}

/**
 * Gets a tenant by ID. Used by dashboard/admin routes.
 */
export async function getTenantById(
  tenantId: string
): Promise<Tenant | null> {
  try {
    return await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  } catch (error) {
    console.error('[TenantResolver] Error getting tenant by ID:', error);
    return null;
  }
}
