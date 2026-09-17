'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { PublicNav } from '@/components/layout/public-nav';
import { ForbiddenView } from '@/components/auth/ForbiddenView';
import { useAuth } from '@/context/auth-context';
import { normalizeUploadUrl } from '@/lib/utils';
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Eye,
  Building2,
  ShieldCheck,
  Sparkles,
  BarChart3,
  CalendarCheck2
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading, role } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  const adminInitials = (user?.nama || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Smooth loading state to prevent flash of content or false forbidden screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/80 animate-pulse flex items-center justify-center font-mono font-bold text-xs text-[#c5a880] shadow-lg">
            SS
          </div>
          <span className="text-xs font-mono text-zinc-500 animate-pulse">
            Memverifikasi hak akses administrator...
          </span>
        </div>
      </div>
    );
  }

  // Block unauthorized direct access (guest or non-admin) with ForbiddenView
  if (!isAuthenticated || role !== 'admin_space') {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col">
        <PublicNav />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <ForbiddenView
            type="admin"
            reason={!isAuthenticated ? 'unauthenticated' : 'insufficient_permissions'}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Desktop Admin Top Header */}
        <header className="hidden lg:flex items-center justify-between h-16 px-6 lg:px-8 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
          </div>

          <div className="flex items-center gap-4">

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-full border transition-all cursor-pointer ${isProfileDropdownOpen
                    ? 'bg-zinc-800 border-[#c5a880]/50 ring-2 ring-[#c5a880]/20'
                    : 'bg-zinc-900/90 hover:bg-zinc-800/90 border-zinc-800 hover:border-zinc-700'
                  }`}
                aria-expanded={isProfileDropdownOpen}
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-mono font-bold text-[#c5a880]">
                  {user?.foto ? (
                    <Image
                      src={normalizeUploadUrl(user.foto, 'members')}
                      alt={user?.nama || 'Admin'}
                      fill
                      sizes="28px"
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span>{adminInitials}</span>
                  )}
                </div>

                <div className="flex flex-col text-left max-w-[130px]">
                  <span className="text-xs font-semibold text-zinc-200 truncate leading-tight">
                    {user?.nama || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono truncate leading-tight">
                    Admin Space
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 mb-2 space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-[#c5a880] shrink-0">
                        {user?.foto ? (
                          <Image
                            src={normalizeUploadUrl(user.foto, 'members')}
                            alt={user?.nama || 'Admin'}
                            fill
                            sizes="36px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <span>{adminInitials}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {user?.nama || 'Administrator'}
                        </div>
                        <div className="text-[11px] text-[#c5a880] font-mono truncate">
                          {user?.nama_coworking || 'The Hive Coworking'}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-[10px] font-mono border-t border-zinc-800/60 text-zinc-400">
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        Admin Operator
                      </span>
                      <span>@{user?.username || 'admin'}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/admin/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                      <span>Profil Coworking & Pengelola</span>
                    </Link>

                    <Link
                      href="/admin/reservations"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      <CalendarCheck2 className="w-4 h-4 text-zinc-400" />
                      <span>Kelola Reservasi</span>
                    </Link>

                    <Link
                      href="/admin/reports"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-zinc-400" />
                      <span>Laporan Finansial</span>
                    </Link>
                  </div>

                  <div className="pt-1.5 mt-1.5 border-t border-zinc-800/80">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar Akun Admin</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
