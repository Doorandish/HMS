'use client';

import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/tenant/tenant-context';
import { MapPin, Phone, Mail, Menu } from 'lucide-react';

export function SiteHeader() {
  const tenant = useTenant();

  if (!tenant) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar - Contact Info */}
      <div className="bg-[var(--tenant-primary)] text-white text-xs py-2 hidden sm:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4">
            {tenant.phone && (
              <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 hover:text-[var(--tenant-accent)] transition-colors">
                <Phone size={14} /> {tenant.phone}
              </a>
            )}
            {tenant.email && (
              <a href={`mailto:${tenant.email}`} className="flex items-center gap-1 hover:text-[var(--tenant-accent)] transition-colors">
                <Mail size={14} /> {tenant.email}
              </a>
            )}
          </div>
          {tenant.address && (
            <div className="flex items-center gap-1">
              <MapPin size={14} /> {tenant.address}, {tenant.city}
            </div>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {tenant.branding.logoUrl ? (
            <img src={tenant.branding.logoUrl} alt={tenant.name} className="h-8 w-auto" />
          ) : (
            <span className="font-bold text-xl tracking-tight text-[var(--tenant-primary)]">
              {tenant.name}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#rooms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Rooms</Link>
          <Link href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</Link>
          <Link href="#reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
          <Link 
            href="/book" 
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--tenant-accent)] hover:opacity-90 rounded-md transition-opacity shadow-sm"
          >
            Book Now
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2 text-foreground">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
