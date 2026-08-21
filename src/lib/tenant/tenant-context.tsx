'use client';

import React, { createContext, useContext, ReactNode } from 'react';

/**
 * Tenant branding configuration shape.
 * Stored as JSON in the database.
 */
export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  logoAlt: string;
  heroImageUrl: string | null;
  heroTitle: string;
  heroSubtitle: string;
  galleryImages: string[];
  customCss: string | null;
}

/**
 * Public-facing tenant data (safe to expose to client).
 */
export interface TenantPublicData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  branding: BrandingConfig;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  timezone: string;
}

const defaultBranding: BrandingConfig = {
  primaryColor: '#1a365d',
  secondaryColor: '#2d3748',
  accentColor: '#ed8936',
  fontFamily: 'Inter, system-ui, sans-serif',
  logoUrl: null,
  logoAlt: 'Hotel Logo',
  heroImageUrl: null,
  heroTitle: 'Welcome to Our Hotel',
  heroSubtitle: 'Experience luxury and comfort',
  galleryImages: [],
  customCss: null,
};

const TenantContext = createContext<TenantPublicData | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantPublicData | null;
  children: ReactNode;
}) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantPublicData | null {
  return useContext(TenantContext);
}

export function useTenantRequired(): TenantPublicData {
  const tenant = useContext(TenantContext);
  if (!tenant) {
    throw new Error(
      'useTenantRequired must be used within a TenantProvider with a valid tenant'
    );
  }
  return tenant;
}

/**
 * Parses raw tenant DB record into public-facing data.
 */
export function parseTenantPublicData(raw: {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  brandingConfig: unknown;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  timezone: string;
}): TenantPublicData {
  const brandingRaw =
    typeof raw.brandingConfig === 'string'
      ? JSON.parse(raw.brandingConfig)
      : raw.brandingConfig;

  return {
    id: raw.id,
    name: raw.name,
    subdomain: raw.subdomain,
    customDomain: raw.customDomain,
    branding: { ...defaultBranding, ...brandingRaw },
    email: raw.email,
    phone: raw.phone,
    address: raw.address,
    city: raw.city,
    country: raw.country,
    postalCode: raw.postalCode,
    latitude: raw.latitude,
    longitude: raw.longitude,
    checkInTime: raw.checkInTime,
    checkOutTime: raw.checkOutTime,
    currency: raw.currency,
    timezone: raw.timezone,
  };
}

export { defaultBranding };
