import { NextRequest, NextResponse } from 'next/server';

/**
 * Multi-Tenant Routing Middleware
 * 
 * Resolves the current tenant from:
 * 1. Custom domain (e.g., hotel-sunshine.com)
 * 2. Subdomain (e.g., sunshine.hms.app)
 * 3. Localhost path prefix for development (e.g., localhost:3000 with ?tenant=sunshine)
 * 
 * Injects tenant identifiers into request headers for downstream consumption.
 */

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';

// Routes that should bypass tenant resolution
const PUBLIC_PATHS = [
  '/api/health',
  '/api/webhooks',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

// Dashboard routes (PMS Extranet)
const DASHBOARD_PREFIX = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip middleware for static files and public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Resolve tenant identifier
  const tenantSlug = resolveTenantSlug(hostname, request);

  // Create response with tenant context headers
  const response = NextResponse.next();
  
  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug);
    response.headers.set('x-tenant-hostname', hostname);
  }

  // For dashboard routes, ensure authentication (placeholder)
  if (pathname.startsWith(DASHBOARD_PREFIX)) {
    // TODO: Check authentication token/session
    // For now, just pass through with tenant context
    response.headers.set('x-route-type', 'dashboard');
  } else {
    response.headers.set('x-route-type', 'website');
  }

  return response;
}

/**
 * Resolves tenant slug from the request hostname.
 * Priority:
 * 1. Query parameter ?tenant= (development only)
 * 2. Custom domain lookup
 * 3. Subdomain extraction
 */
function resolveTenantSlug(
  hostname: string,
  request: NextRequest
): string | null {
  // Development: allow ?tenant= query parameter
  if (process.env.NODE_ENV === 'development') {
    const tenantParam = request.nextUrl.searchParams.get('tenant');
    if (tenantParam) return tenantParam;
  }

  // Remove port number for comparison
  const cleanHostname = hostname.split(':')[0];

  // Skip localhost without tenant param
  if (
    cleanHostname === 'localhost' ||
    cleanHostname === '127.0.0.1'
  ) {
    // Default to demo tenant in development
    if (process.env.NODE_ENV === 'development') {
      return 'demo';
    }
    return null;
  }

  // Extract the base app domain (without port)
  const appDomainClean = APP_DOMAIN.split(':')[0];

  // Check if it's a subdomain of the app domain
  if (cleanHostname.endsWith(`.${appDomainClean}`)) {
    const subdomain = cleanHostname.replace(`.${appDomainClean}`, '');
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
    return null;
  }

  // Custom domain: the hostname itself is the identifier
  // The tenant-resolver service will look this up in the DB
  return `domain:${cleanHostname}`;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
