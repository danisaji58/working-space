'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/Button';

export function PublicNav() {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const publicLinks = [
    { href: '#katalog', label: 'Pilihan Ruang' },
    { href: '#fasilitas', label: 'Standar Fasilitas' },
    { href: '#cara-pesan', label: 'Cara Reservasi' },
    { href: '#promo', label: 'Promo Spesial' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
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

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {publicLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-mono hidden lg:inline">
                  Halo, <span className="text-zinc-200 font-medium">{user?.nama?.split(' ')[0] || 'Member'}</span>
                </span>
                <Link href="/member">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
                    rightIcon={<ArrowRight className="w-3 h-3" />}
                  >
                    Buka Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
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

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {publicLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/member" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  leftIcon={<LayoutDashboard className="w-4 h-4" />}
                >
                  Buka Dashboard ({user?.nama?.split(' ')[0] || 'Member'})
                </Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register/member" onClick={() => setIsMobileMenuOpen(false)}>
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
