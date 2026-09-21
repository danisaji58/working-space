'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  CalendarCheck,
  Clock,
  Compass,
  ArrowRight,
  Ticket,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  ChevronRight,
  Plus,
  Building,
  User,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getMyReservations, getMyHistory } from '@/lib/api/reservations';
import { getSpaces } from '@/lib/api/spaces';
import { Reservation, Space } from '@/types/api';
import {
  formatIDR,
  formatDate,
  calculateEndTime,
  getSpaceTypeLabel,
  resolveSpaceImage,
} from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/EmptyState';

export default function MemberDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([]);
  const [recommendedSpaces, setRecommendedSpaces] = useState<Space[]>([]);
  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [totalHoursUsed, setTotalHoursUsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [resActive, resHistory, resSpaces] = await Promise.all([
          getMyReservations(),
          getMyHistory(),
          getSpaces(),
        ]);

        if (resActive.status && Array.isArray(resActive.data)) {
          setActiveReservations(resActive.data);
        }

        if (resHistory.status && resHistory.data) {
          const items = resHistory.data.items || [];
          setHistoryTotal(items.length);
          const hours = items.reduce(
            (sum, item) => sum + (Number(item.durasi_jam) || 0),
            0
          );
          setTotalHoursUsed(hours);
        }

        if (resSpaces.status && Array.isArray(resSpaces.data)) {
          setRecommendedSpaces(resSpaces.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const latestActive = activeReservations.length > 0 ? activeReservations[0] : null;

  return (
    <div className="space-y-8">
      {/* Personalized Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-900">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <span className="text-zinc-400 font-normal">{todayFormatted}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {getGreeting()},{' '}
            <span className="text-[#dfcbb5]">{user?.nama || 'Member'}</span> 👋
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400">
            Kelola jadwal workstation, tiket QR digital, dan reservasi ruang kerja Anda di satu tempat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/member/spaces">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Pesan Ruang Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Bookings */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Reservasi Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#c5a880]/10 flex items-center justify-center text-[#c5a880]">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {activeReservations.length}
            </span>
            <span className="text-xs text-zinc-400">sesi</span>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
            <span>{activeReservations.length > 0 ? 'Siap digunakan' : 'Tidak ada jadwal hari ini'}</span>
          </div>
        </div>

        {/* Metric 2: Completed Bookings */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Sesi Selesai
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {historyTotal}
            </span>
            <span className="text-xs text-zinc-400">kali sewa</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            Tercatat di riwayat akun
          </div>
        </div>

        {/* Metric 3: Hours Logged */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Jam Produktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {totalHoursUsed}
            </span>
            <span className="text-xs text-zinc-400">jam total</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            Workstation & meeting
          </div>
        </div>

        {/* Metric 4: Account Tier */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Status Member
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-white">
              Terverifikasi
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 truncate font-mono">
            {user?.instansi || 'SMK Telkom Malang'}
          </div>
        </div>
      </div>

      {/* Active Reservation Spotlight Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#c5a880]" />
            <span>Jadwal Reservasi Mendatang</span>
          </h2>
          {activeReservations.length > 1 && (
            <Link
              href="/member/reservations"
              className="text-xs font-mono text-[#c5a880] hover:text-white transition-colors"
            >
              Lihat Semua ({activeReservations.length}) ➔
            </Link>
          )}
        </div>

        {isLoading ? (
          <LoadingSkeleton rows={2} />
        ) : latestActive ? (
          <div className="card-luxury p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-zinc-800/90">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                <Image
                  src={resolveSpaceImage(latestActive.space || { foto: latestActive.foto_space })}
                  alt={latestActive.nama_space || 'Workstation'}
                  fill
                  unoptimized
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={latestActive.status} />
                  <span className="text-xs text-zinc-400 font-mono">
                    Kode: SSB-{String(latestActive.id_reservasi ?? latestActive.id ?? 1).padStart(6, '0')}
                  </span>
                  {latestActive.tipe_space && (
                    <span className="text-[11px] text-zinc-400 font-mono">
                      • {getSpaceTypeLabel(latestActive.tipe_space)}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-white tracking-tight">
                  {latestActive.nama_space || 'Personal Workstation'}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-mono">
                  <span className="text-[#dfcbb5]">
                    {formatDate(latestActive.tanggal_reservasi)}
                  </span>
                  <span>•</span>
                  <span>
                    {latestActive.jam_mulai} -{' '}
                    {calculateEndTime(latestActive.jam_mulai, latestActive.durasi_jam)} WIB (
                    {latestActive.durasi_jam} Jam)
                  </span>
                  <span>•</span>
                  <span className="text-white font-semibold">
                    {formatIDR(latestActive.total_harga || latestActive.total_bayar || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800">
              <Link
                href={`/member/reservations/${latestActive.id_reservasi ?? latestActive.id}/ticket`}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Ticket className="w-4 h-4" />}
                  className="w-full"
                >
                  Buka E-Ticket & QR
                </Button>
              </Link>
              <Link href="/member/reservations" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="w-full">
                  Semua Jadwal
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto text-[#c5a880]">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-semibold text-white">
                Belum Ada Jadwal Reservasi Aktif
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Workstation ergonomis, ruang rapat 4K, dan artisan brew bar siap menyambut sesi kerja fokus Anda hari ini.
              </p>
            </div>
            <div>
              <Link href="/member/spaces">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Cari Meja & Ruang Sekarang
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#c5a880]" />
          <span>Akses Cepat Layanan</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/member/spaces"
            className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#c5a880] group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-[#dfcbb5] transition-colors flex items-center justify-between">
              <span>Jelajah Ruang</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cari workstation, ruang rapat, dan kantor privat sesuai kapasitas.
            </p>
          </Link>

          <Link
            href="/member/reservations"
            className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#c5a880] group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-[#dfcbb5] transition-colors flex items-center justify-between">
              <span>Tiket & QR Code</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Akses E-Ticket digital untuk check-in instan saat tiba di lokasi.
            </p>
          </Link>

          <Link
            href="/member/history"
            className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#c5a880] group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-[#dfcbb5] transition-colors flex items-center justify-between">
              <span>Riwayat Pemesanan</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Rekap seluruh sesi kerja lampau dan total pengeluaran Anda.
            </p>
          </Link>

          <Link
            href="/member/profile"
            className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all group space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[#c5a880] group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-[#dfcbb5] transition-colors flex items-center justify-between">
              <span>Profil Pengguna</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kelola data nama, instansi, nomor telepon, dan preferensi akun.
            </p>
          </Link>
        </div>
      </div>

      {/* Recommended Spaces Carousel/Grid */}
      <div className="space-y-4 pt-4 border-t border-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Rekomendasi Ruang Kerja Populer
            </h2>
            <p className="text-xs text-zinc-400">
              Pilihan ruang favorit yang sering dipesan oleh para profesional.
            </p>
          </div>
          <Link
            href="/member/spaces"
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Katalog Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendedSpaces.map((space) => {
            const spaceId = space.id_space ?? space.id ?? 1;
            return (
              <div
                key={spaceId}
                className="card-luxury rounded-2xl overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
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

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-[#dfcbb5] transition-colors line-clamp-1">
                      {space.nama_space}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Kapasitas {space.kapasitas} Orang</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-zinc-800/50 mt-2">
                  <div>
                    <span className="text-xs font-bold text-white font-mono">
                      {formatIDR(space.harga_per_jam)}
                    </span>
                    <span className="text-[10px] text-zinc-400">/jam</span>
                  </div>

                  <Link href={`/member/spaces/${spaceId}`}>
                    <Button variant="outline" size="sm">
                      Pesan
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
