import React from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { BookingProvider } from '@/components/booking/booking-flow-context';
import { BookingStepsContainer } from '@/components/booking/booking-steps-container';

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  
  // Convert searchParams to simple string record for the provider
  const initialParams: Record<string, string> = {};
  for (const key in resolvedSearchParams) {
    const val = resolvedSearchParams[key];
    if (typeof val === 'string') {
      initialParams[key] = val;
    } else if (Array.isArray(val) && val.length > 0) {
      initialParams[key] = val[0];
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <BookingProvider initialSearchParams={initialParams}>
            <BookingStepsContainer />
          </BookingProvider>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
