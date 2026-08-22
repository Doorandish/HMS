'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { TenantPublicData } from './tenant-utils';

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
