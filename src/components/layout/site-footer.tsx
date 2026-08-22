'use client';

import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/tenant/tenant-context';
import { Globe } from 'lucide-react';

export function SiteFooter() {
  const tenant = useTenant();
  const year = new Date().getFullYear();

  if (!tenant) return null;

  return (
    <footer className="bg-[var(--tenant-primary)] text-white pt-12 pb-6">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand & Address */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl mb-4">{tenant.name}</h3>
          {tenant.address && <p className="text-sm text-white/80">{tenant.address}</p>}
          {tenant.city && <p className="text-sm text-white/80">{tenant.postalCode} {tenant.city}, {tenant.country}</p>}
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-4 text-[var(--tenant-accent)]">Contact Us</h4>
          {tenant.phone && <p className="text-sm text-white/80">Tel: {tenant.phone}</p>}
          {tenant.email && <p className="text-sm text-white/80">Email: {tenant.email}</p>}
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-4 text-[var(--tenant-accent)]">Information</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="#rooms" className="hover:text-white transition-colors">Rooms & Suites</Link></li>
            <li><Link href="#services" className="hover:text-white transition-colors">Services</Link></li>
            <li><Link href="/book" className="hover:text-white transition-colors">Book Online</Link></li>
          </ul>
        </div>

        {/* Legal & Social */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg mb-4 text-[var(--tenant-accent)]">Legal</h4>
          <ul className="space-y-2 text-sm text-white/80">
            {(tenant as any).termsUrl && <li><a href={(tenant as any).termsUrl} className="hover:text-white transition-colors">Terms & Conditions</a></li>}
            {(tenant as any).privacyUrl && <li><a href={(tenant as any).privacyUrl} className="hover:text-white transition-colors">Privacy Policy</a></li>}
            {(tenant as any).impressumUrl && <li><a href={(tenant as any).impressumUrl} className="hover:text-white transition-colors">Impressum</a></li>}
          </ul>
          
          <div className="flex gap-4 mt-6">
            <a href="#" className="text-white/80 hover:text-[var(--tenant-accent)] transition-colors text-sm font-medium">Facebook</a>
            <a href="#" className="text-white/80 hover:text-[var(--tenant-accent)] transition-colors text-sm font-medium">Instagram</a>
            <a href="#" className="text-white/80 hover:text-[var(--tenant-accent)] transition-colors text-sm font-medium">X (Twitter)</a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 border-t border-white/10 text-center text-sm text-white/60">
        <p>&copy; {year} {tenant.name}. All rights reserved.</p>
        <p className="mt-2 text-xs">Powered by HMS</p>
      </div>
    </footer>
  );
}
