'use client';

import React from 'react';
import { useTenant } from '@/lib/tenant/tenant-context';
import { BookingSearchBar } from './booking-search-bar';
import { motion } from 'framer-motion';

export function HeroHeader() {
  const tenant = useTenant();

  if (!tenant) return null;

  // Use a default beautiful image if none is configured
  const bgImage = (tenant.branding as any).heroImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';

  return (
    <section className="relative">
      {/* Background Image with Overlay */}
      <div 
        className="h-[70vh] min-h-[500px] bg-cover bg-center relative"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg max-w-4xl tracking-tight"
          >
            {tenant.branding.heroTitle || `Welcome to ${tenant.name}`}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md font-medium"
          >
            {tenant.branding.heroSubtitle || 'Experience luxury and comfort at its finest.'}
          </motion.p>
        </div>
      </div>

      {/* Booking Search Bar overlaying the bottom edge */}
      <div className="px-4">
        <BookingSearchBar />
      </div>
    </section>
  );
}
