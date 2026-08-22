'use client';

import React, { useEffect } from 'react';
import { useTenant } from '@/lib/tenant/tenant-context';

function getHslFromHex(hex: string): string {
  // Simple fallback for hex to HSL variables if needed,
  // but we can just inject hex as CSS variables for simplicity
  return hex;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const tenant = useTenant();

  useEffect(() => {
    if (!tenant) return;

    const root = document.documentElement;
    const { primaryColor, secondaryColor, accentColor, fontFamily } = tenant.branding;

    // Inject CSS variables for the tenant
    root.style.setProperty('--tenant-primary', primaryColor);
    root.style.setProperty('--tenant-secondary', secondaryColor);
    root.style.setProperty('--tenant-accent', accentColor);
    
    // Set font family if provided
    if (fontFamily) {
      root.style.setProperty('--tenant-font', fontFamily);
      document.body.style.fontFamily = `var(--tenant-font), sans-serif`;
    }

  }, [tenant]);

  return <>{children}</>;
}
