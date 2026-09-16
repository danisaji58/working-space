'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Wifi,
  Coffee,
  Shield,
  Clock,
  Sparkles,
  Users,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MemberNav } from '@/components/layout/member-nav';
import { getSpaces } from '@/lib/api/spaces';
import { useAuth } from '@/context/auth-context';
import { Space } from '@/types/api';
import { formatIDR, getSpaceTypeLabel, resolveSpaceImage } from '@/lib/utils';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    getSpaces().then((res) => {
      if (res.status && res.data) {
        setSpaces(res.data.slice(0, 3));
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col selection:bg-[#c5a880]/30 selection:text-[#dfcbb5]">
      <MemberNav />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden border-b border-zinc-900">
        {/* Subtle radial architectural spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(197,168,128,0.08),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            {isAuthenticated && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#dfcbb5] border border-[#c5a880]/30 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Selamat datang kembali, <strong>{user?.nama || 'Member'}</strong></span>
              </div>
            )}

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Ruang Kerja Presisi. <br />
              <span className="text-zinc-400 font-normal">Fokus Tanpa Kompromi.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl font-normal">
              Platform reservasi workstation, ruang rapat eksekutif, dan private office premium. Nikmati konektivitas gigabit, akustik kedap suara, dan kursi ergonomis untuk produktivitas optimal.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  <Link href="/member">
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Buka Dashboard Member
                    </Button>
                  </Link>
                  <Link href="/member/spaces">
                    <Button size="lg" variant="outline" rightIcon={<Compass className="w-4 h-4" />}>
                      Jelajah Ruang
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/member/spaces">
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Reservasi Ruang Sekarang
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline">
                      Masuk Akun
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-zinc-900 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">1 Gbps</div>
                <div className="text-xs text-zinc-400 mt-1 font-mono uppercase">Optical Fiber</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">24/7</div>
                <div className="text-xs text-zinc-400 mt-1 font-mono uppercase">Keycard Access</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono">100%</div>
                <div className="text-xs text-zinc-400 mt-1 font-mono uppercase">Ergonomic</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Architectural Spaces */}
      <section className="py-20 md:py-28 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#c5a880] uppercase tracking-widest mb-1">
                Koleksi Ruang Terkurasi
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Pilihan Workstation & Atelier
              </h2>
            </div>
            <Link
              href="/member/spaces"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>Lihat Semua Koleksi Ruang</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const spaceId = space.id_space ?? space.id ?? 1;
              return (
                <div
                  key={spaceId}
                  className="card-luxury rounded-2xl overflow-hidden group flex flex-col justify-between"
                >
                  <div>
                    {/* Image container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      <Image
                        src={resolveSpaceImage(space)}
                        alt={space.nama_space}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="accent" size="sm">
                          {getSpaceTypeLabel(space.tipe)}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-[#dfcbb5] transition-colors line-clamp-1">
                          {space.nama_space}
                        </h3>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {space.deskripsi}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Kapasitas {space.kapasitas} Orang</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-zinc-800/40 mt-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-mono">Tarif Sewa</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {formatIDR(space.harga_per_jam)}
                      </span>
                      <span className="text-[10px] text-zinc-400">/jam</span>
                    </div>

                    <Link href={`/member/spaces/${spaceId}`}>
                      <Button size="sm" variant="outline">
                        Pesan Ruang
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities & Architectural Value Section */}
      <section className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <div className="text-xs font-mono text-[#c5a880] uppercase tracking-widest mb-1">
              Standar Fasilitas
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Didesain untuk Performa & Ketelitian
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Setiap sudut ruang kerja dirancang dengan pertimbangan akustik, ergonomi, dan keandalan sistem daya cadangan uninterrupted.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <Wifi className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Dedicated Fiber Optic</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Jaringan simetris ultra low-latency dengan backup multi-ISP untuk coding, upload dataset, dan telekonferensi 4K.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Artisan Brew Bar</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kopi arabika single origin racikan segar dan artisan tea gratis tanpa batas untuk menemani sesi kerja fokus Anda.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Instant Check-In QR</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tanpa antrean resepsionis manual. Cukup pindai E-Ticket digital langsung dari ponsel Anda saat tiba di lokasi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Akses Keamanan Terpadu</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sistem smart lock keycard, pengawasan CCTV cloud 24 jam, dan loker penyimpanan pribadi terenkripsi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action banner */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-luxury p-8 sm:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Siap untuk Sesi Kerja yang Lebih Produktif?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Pilih meja atau ruang rapat favorit Anda hari ini. Gunakan kode promo <code className="text-[#dfcbb5] font-mono">DISKONHEMAT20</code> untuk potongan 20%.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Link href="/member/spaces">
                <Button size="lg" variant="primary" rightIcon={<Compass className="w-4 h-4" />}>
                  Mulai Reservasi Ruang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Editorial Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-white font-bold font-mono text-[10px]">
              SS
            </div>
            <span className="font-semibold text-zinc-300">Smart Space Booking</span>
            <span>• UKK Rekayasa Perangkat Lunak SMK Telkom</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <Link href="/login" className="hover:text-zinc-200">Masuk</Link>
            <Link href="/register/member" className="hover:text-zinc-200">Daftar Member</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
