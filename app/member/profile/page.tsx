'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Building, Phone, MapPin, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MemberProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Informasi Akun</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Profil Member Pengunjung
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Data identitas Anda yang terdaftar pada sistem reservasi coworking space.
        </p>
      </div>

      {/* Profile Card */}
      <div className="card-luxury p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-zinc-800">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-md shrink-0">
            <Image
              src={
                user?.foto ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              }
              alt={user?.nama || 'Member'}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {user?.nama || 'Ahmad Fauzi'}
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              @{user?.username || 'ahmad_fauzi'} • Role: Member
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono mt-1">
              Akun Terverifikasi
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <Building className="w-3.5 h-3.5 text-zinc-400" />
              <span>Instansi / Lembaga</span>
            </div>
            <div className="text-sm font-semibold text-white">
              {user?.instansi || 'SMK Telkom Malang (RPL)'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>Nomor Telepon</span>
            </div>
            <div className="text-sm font-semibold text-white font-mono">
              {user?.telp || '0812-3456-7890'}
            </div>
          </div>

          <div className="sm:col-span-2 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Alamat Domisili</span>
            </div>
            <div className="text-xs text-zinc-200 leading-relaxed">
              {user?.alamat || 'Jl. Danau Ranau G7 B-12, Sawojajar, Kota Malang, Jawa Timur'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Tersimpan di sesi terenkripsi
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Keluar dari Akun
          </Button>
        </div>
      </div>
    </div>
  );
}
