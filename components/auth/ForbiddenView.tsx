'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  LogIn,
  UserPlus,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ForbiddenView() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Glowing 403 Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#c5a880]/20 rounded-full blur-2xl transform scale-150 pointer-events-none" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-900 border border-zinc-700/80 shadow-2xl flex items-center justify-center text-[#c5a880] mx-auto">
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Area Khusus Member Terdaftar
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Halaman ini hanya dapat diakses setelah masuk ke akun member Smart Space Anda. Silakan login atau daftarkan akun baru untuk melanjutkan.
          </p>
        </div>

        {/* Benefits Card */}
        <div className="card-luxury p-5 rounded-2xl text-left border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Benefit Akun Member</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-300 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reservasi Instan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tiket QR Digital</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Kupon Diskon 20%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full"
            >
              Masuk ke Akun
            </Button>
          </Link>

          <Link href="/register/member" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="w-full"
            >
              Daftar Member Baru
            </Button>
          </Link>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
