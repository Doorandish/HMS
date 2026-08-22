import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { CheckCircle2, Calendar, MapPin, CreditCard } from 'lucide-react';

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const resNumber = typeof resolvedParams.resNumber === 'string' ? resolvedParams.resNumber : 'UNKNOWN';

  return (
    <>
      <SiteHeader />
      <main className="flex-grow bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden text-center">
            
            <div className="bg-green-500 p-8 text-white">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={64} className="text-white drop-shadow-md" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-white/90">Thank you for choosing our hotel.</p>
            </div>

            <div className="p-8">
              <p className="text-muted-foreground mb-2">Your reservation number is:</p>
              <div className="text-2xl font-mono font-bold bg-gray-100 py-3 px-6 rounded-lg inline-block mb-8 text-[var(--tenant-primary)] tracking-wider border border-gray-200">
                {resNumber}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                    <Calendar size={18} className="text-gray-400" />
                    Next Steps
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email with all the details of your stay.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                    <CreditCard size={18} className="text-gray-400" />
                    Payment
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your payment has been successfully processed and secured.
                  </p>
                </div>
              </div>

              <Link 
                href="/"
                className="inline-block px-8 py-3 bg-[var(--tenant-primary)] hover:opacity-90 text-white font-medium rounded-lg transition-colors"
              >
                Return to Homepage
              </Link>
            </div>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
