'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Compass,
  CalendarCheck,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  Layers,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/Button';

export function MemberNav() {
  const pathname = usePathname();
  const { user, role, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Main navigation links (Profil is moved to top right user profile avatar)
  const navLinks = [
    { href: '/member', label: 'Dashboard', icon: Layers },
    { href: '/member/spaces', label: 'Jelajah Ruang', icon: Compass },
    { href: '/member/reservations', label: 'Reservasi Saya', icon: CalendarCheck },
    { href: '/member/history', label: 'Riwayat', icon: Clock },
  ];

  // Close dropdown when clicking outside
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

  // Close dropdown on route change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const userInitials = (user?.nama || 'Member')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href={isAuthenticated ? '/member' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold font-mono text-sm tracking-wider shadow-sm group-hover:bg-[#c5a880] transition-colors">
                SS
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-white">
                  SMART SPACE
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                  Coworking & Atelier
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === '/member'
                  ? pathname === '/member'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive
                    ? 'bg-zinc-800/90 text-white font-semibold shadow-xs border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
                    }`}
                >
                  {/* <Icon className="w-3.5 h-3.5" /> */}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header: User Profile Dropdown or Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Trigger Button */}
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className={`flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-full border transition-all cursor-pointer ${isProfileDropdownOpen
                    ? 'bg-zinc-800 border-[#c5a880]/50 ring-2 ring-[#c5a880]/20'
                    : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 hover:border-zinc-700'
                    }`}
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  {/* User Avatar */}
                  <div className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-mono font-bold text-zinc-200">
                    {user?.foto ? (
                      <Image
                        src={user.foto}
                        alt={user?.nama || 'User'}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>

                  {/* Name & Instansi */}
                  <div className="flex flex-col text-left max-w-[130px]">
                    <span className="text-xs font-semibold text-zinc-200 truncate leading-tight">
                      {user?.nama || 'Member'}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate leading-tight">
                      {user?.instansi || (role === 'admin_space' ? 'Admin Coworking' : 'Verified Member')}
                    </span>
                  </div>

                  {/* Chevron Icon */}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180 text-white' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu Popover */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-950 border border-zinc-800/90 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Header Details */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 mb-2 space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-mono text-xs font-bold text-[#c5a880] shrink-0">
                          {user?.foto ? (
                            <Image
                              src={user.foto}
                              alt={user?.nama || 'User'}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <span>{userInitials}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {user?.nama || 'Member'}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono truncate">
                            @{user?.username || 'member'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono border-t border-zinc-800/60 text-zinc-400">
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          {role === 'admin_space' ? 'Admin Access' : 'Verified Member'}
                        </span>
                        {user?.instansi && (
                          <span className="truncate max-w-[100px] text-zinc-400">
                            {user.instansi}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className="space-y-0.5">
                      <Link
                        href="/member/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        <span>Profil & Pengaturan Akun</span>
                      </Link>

                      <Link
                        href="/member/reservations"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4 text-zinc-400" />
                        <span>Reservasi & E-Ticket</span>
                      </Link>

                      <Link
                        href="/member/history"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span>Riwayat Transaksi</span>
                      </Link>

                      {role === 'admin_space' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#c5a880] hover:text-[#dfcbb5] hover:bg-[#c5a880]/10 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#c5a880]" />
                          <span>Buka Console Admin</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                        </Link>
                      )}
                    </div>

                    {/* Divider & Logout */}
                    <div className="pt-1.5 mt-1.5 border-t border-zinc-800/80">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Akun (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register/member">
                  <Button variant="primary" size="sm">
                    Daftar Member
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated && (
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-200 shrink-0">
                {user?.foto ? (
                  <Image
                    src={user.foto}
                    alt={user?.nama || 'User'}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  {user?.nama || 'Member'}
                </div>
                <div className="text-xs text-zinc-400 font-mono truncate">
                  {user?.instansi || 'Verified Member'}
                </div>
              </div>
              <Link
                href="/member/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === '/member'
                  ? pathname === '/member'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <Link
                href="/member/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${pathname === '/member/profile'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
              >
                <User className="w-4 h-4" />
                <span>Profil Saya</span>
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full mt-1"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Keluar Akun ({user?.nama})
              </Button>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link href="/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register/member" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
