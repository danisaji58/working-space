'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  Building,
  Phone,
  MapPin,
  LogOut,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Sparkles,
  User,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MemberProfilePage() {
  const { user, logout } = useAuth();

  const userInitials = (user?.nama || 'Member')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Profil Member Pengunjung
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Data identitas akun Anda yang terdaftar pada sistem reservasi coworking space.
        </p>
      </div>

      {/* Profile Card */}
      <div className="card-luxury p-6 sm:p-8 rounded-3xl space-y-6 border border-zinc-800">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-zinc-800/80">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-md shrink-0 flex items-center justify-center font-mono font-bold text-xl text-[#c5a880]">
            {user?.foto ? (
              <Image
                src={user.foto}
                alt={user?.nama || 'Member'}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <span>{userInitials}</span>
            )}
            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-950" />
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {user?.nama || 'Ahmad Fauzi'}
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  @{user?.username || 'ahmad_fauzi'} • Role: Member
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono self-center sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Akun Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <Building className="w-3.5 h-3.5 text-zinc-400" />
              <span>Instansi / Lembaga</span>
            </div>
            <div className="text-sm font-semibold text-white">
              {user?.instansi || 'SMK Telkom Malang (RPL)'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>Nomor Telepon</span>
            </div>
            <div className="text-sm font-semibold text-white font-mono">
              {user?.telp || '0812-3456-7890'}
            </div>
          </div>

          <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Alamat Domisili</span>
            </div>
            <div className="text-xs text-zinc-200 leading-relaxed">
              {user?.alamat || 'Jl. Danau Ranau G7 B-12, Sawojajar, Kota Malang, Jawa Timur'}
            </div>
          </div>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link href="/member/reservations">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-[#c5a880]/40 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4 text-[#c5a880]" />
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                  Kelola Reservasi & Tiket
                </span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">→</span>
            </div>
          </Link>

          <Link href="/member/history">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-[#c5a880]/40 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#c5a880]" />
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                  Riwayat & Laporan Sesi
                </span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">→</span>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Sesi aman terenkripsi token JWT
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Keluar dari Akun (Logout)
          </Button>
        </div>
      </div>
    </div>
  );
}
