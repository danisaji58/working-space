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
  Lock,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';

export interface ForbiddenViewProps {
  type?: 'member' | 'admin' | 'general';
  reason?: 'unauthenticated' | 'insufficient_permissions';
  title?: string;
  description?: string;
}

export function ForbiddenView({
  type = 'member',
  reason = 'unauthenticated',
  title,
  description,
}: ForbiddenViewProps) {
  const { logout } = useAuth();
  const isAdmin = type === 'admin';
  const isInsufficient = reason === 'insufficient_permissions';

  // Resolved titles and descriptions based on role & reason
  const displayTitle =
    title ||
    (isAdmin
      ? isInsufficient
        ? 'Akses Ditolak - Area Administrator'
        : '403 Forbidden - Otorisasi Admin Diperlukan'
      : 'Area Khusus Member Terdaftar');

  const displayDescription =
    description ||
    (isAdmin
      ? isInsufficient
        ? 'Akun Anda saat ini login sebagai Member dan tidak memiliki hak akses operasional (role: admin_space) untuk membuka konsol administrator ini.'
        : 'Halaman administrasi dilindungi sistem keamanan ketat. Akses langsung melalui link tanpa login aktif diblokir untuk menjaga integritas data coworking space.'
      : 'Halaman ini hanya dapat diakses setelah masuk ke akun member Smart Space Anda. Akses langsung tanpa login diblokir untuk keamanan privasi dan pemesanan.');

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 w-full">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Glowing 403 Icon */}
        <div className="relative inline-block">
          <div
            className={`absolute inset-0 rounded-full blur-2xl transform scale-150 pointer-events-none ${isAdmin
              ? isInsufficient
                ? 'bg-amber-500/25'
                : 'bg-rose-500/20'
              : 'bg-[#c5a880]/20'
              }`}
          />
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-zinc-900 border shadow-2xl flex items-center justify-center mx-auto transition-transform ${isAdmin
              ? isInsufficient
                ? 'border-amber-700/80 text-amber-400'
                : 'border-rose-700/80 text-rose-400'
              : 'border-zinc-700/80 text-[#c5a880]'
              }`}
          >
            {isAdmin ? (
              isInsufficient ? (
                <Lock className="w-10 h-10 sm:w-12 sm:h-12" />
              ) : (
                <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
              )
            ) : (
              <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase border border-zinc-800 bg-zinc-900/90 text-zinc-400">
            {isAdmin ? (
              <span className="text-rose-400">403 FORBIDDEN • ADMIN ONLY</span>
            ) : (
              <span className="text-[#c5a880]">403 FORBIDDEN • MEMBER ONLY</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            {displayTitle}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* Security / Benefits Card */}
        {isAdmin ? (
          <div className="card-luxury p-5 rounded-2xl text-left border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protokol Keamanan Administrator</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Otentikasi JWT Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>RBAC admin_space</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Proteksi Route Otomatis</span>
              </div>
            </div>
          </div>
        ) : (
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
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAdmin ? (
            isInsufficient ? (
              <>
                <Link href="/member" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    leftIcon={<LayoutDashboard className="w-4 h-4" />}
                    className="w-full"
                  >
                    Buka Dashboard Member
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  leftIcon={<LogOut className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                  onClick={logout}
                >
                  Ganti ke Akun Admin
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    leftIcon={<LogIn className="w-4 h-4" />}
                    className="w-full"
                  >
                    Masuk Akun Admin
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    className="w-full"
                  >
                    Kembali ke Beranda
                  </Button>
                </Link>
              </>
            )
          ) : (
            <>
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
            </>
          )}
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
