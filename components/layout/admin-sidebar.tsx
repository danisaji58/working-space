'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck2,
  Building2,
  Users,
  Tag,
  BarChart3,
  Settings,
  Eye,
  LogOut,
  Menu,
  X,
  Sparkles,
  Database,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/reservations', label: 'Reservasi', icon: CalendarCheck2 },
    { href: '/admin/spaces', label: 'Ruang Kerja', icon: Building2 },
    { href: '/admin/members', label: 'Data Member', icon: Users },
    { href: '/admin/discounts', label: 'Diskon & Promo', icon: Tag },
    { href: '/admin/reports', label: 'Laporan Finansial', icon: BarChart3 },
    { href: '/admin/profile', label: 'Profil Coworking', icon: Settings },
    // { href: '/admin/api-hub', label: 'Kontrak API (50 EP)', icon: Database },
  ];

  return (
    <>
      {/* Mobile top navigation bar */}
      <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#c5a880] flex items-center justify-center text-zinc-950 font-bold font-mono text-xs">
            SS
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            ADMIN WORKSPACE
          </span>
        </div>
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800/80">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-bold font-mono text-xs shadow">
                SS
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-zinc-100">
                  SMART SPACE
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#c5a880]">
                  Admin Console
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-4">
            <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              Menu Utama
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpenMobile(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="p-3 border-t border-zinc-800/80 space-y-1.5">
          <Link
            href="/member"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
          >
            <Eye className="w-4 h-4 text-zinc-400" />
            <span>Lihat Tampilan Member</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
