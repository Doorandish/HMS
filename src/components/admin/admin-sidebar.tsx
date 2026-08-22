'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, ClipboardList, Settings, Users, LogOut, Globe, CircleDollarSign, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/lib/tenant/tenant-context';

export function AdminSidebar() {
  const pathname = usePathname();
  const tenant = useTenant();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Tape Chart', href: '/admin/calendar', icon: CalendarDays },
    { name: 'Housekeeping', href: '/admin/housekeeping', icon: ClipboardList },
    { name: 'Rates & Inventory', href: '/admin/rates', icon: CircleDollarSign },
    { name: 'Website Builder', href: '/admin/website-builder', icon: Globe },
    { name: 'Guests', href: '/admin/guests', icon: Users },
    { name: 'Reservations', href: '/admin/reservations', icon: ClipboardList },
    { name: 'AI Assistant', href: '/admin/ai-assistant', icon: Sparkles },
    { name: 'Settings', href: '#', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-1">{tenant?.name || 'Hotel Admin'}</h2>
        <p className="text-xs text-gray-500 uppercase tracking-wider">PMS Extranet</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== '#';
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon size={18} className={isActive ? "text-[var(--tenant-primary)]" : "text-gray-400"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-800">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium hover:bg-gray-800 hover:text-white transition-colors">
          <LogOut size={18} className="text-gray-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
