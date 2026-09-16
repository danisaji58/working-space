import React from 'react';
import Link from 'next/link';
import { User, Shield, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RegisterHubPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#0b0b0c] relative">
      <div className="w-full max-w-2xl space-y-8 relative z-10 text-center">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-bold font-mono text-sm shadow">
              SS
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              SMART SPACE
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Pilih Jenis Akun Pendaftaran
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Daftarkan diri Anda sebagai pengunjung untuk reservasi ruang kerja atau sebagai pengelola ruang coworking.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Member Card */}
          <div className="card-luxury p-7 rounded-2xl flex flex-col justify-between group hover:border-zinc-500 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-white group-hover:bg-[#c5a880] group-hover:text-zinc-950 transition-colors">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Member / Pengunjung</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Untuk pelajar, freelancer, remote worker, dan tim yang ingin memesan ruang kerja & workstation.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Jelajah & booking workstation fleksibel</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Klaim kode promo & potongan harga</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unduh E-Ticket digital dengan QR Code</span>
                </li>
              </ul>
            </div>

            <Link href="/register/member" className="mt-6">
              <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Daftar sebagai Member
              </Button>
            </Link>
          </div>

          {/* Admin Space Card */}
          <div className="card-luxury p-7 rounded-2xl flex flex-col justify-between group hover:border-[#c5a880]/50 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-[#c5a880] group-hover:bg-[#c5a880] group-hover:text-zinc-950 transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Admin Pengelola Space</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Untuk pemilik fasilitas dan manajer operasional coworking space & workstation.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Kelola ruang, tarif, dan ketersediaan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Verifikasi reservasi, check-in, dan check-out</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Laporan analitik finansial & distribusi tipe</span>
                </li>
              </ul>
            </div>

            <Link href="/register/admin" className="mt-6">
              <Button variant="secondary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Daftar Pengelola Space
              </Button>
            </Link>
          </div>
        </div>

        {/* Existing account link */}
        <p className="text-xs text-zinc-400">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-white hover:text-[#c5a880] font-medium underline underline-offset-4">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
