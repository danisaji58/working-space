'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  CalendarCheck,
  Clock,
  Compass,
  ArrowRight,
  Wifi,
  Coffee,
  Shield,
  Layers,
  ChevronRight,
  Users,
  Ticket,
  CheckCircle2,
  Tag,
  Copy,
  Check,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getSpaces } from '@/lib/api/spaces';
import { getMyReservations } from '@/lib/api/reservations';
import { Space, Reservation } from '@/types/api';
import { formatIDR, formatDate, calculateEndTime, getSpaceTypeLabel, resolveSpaceImage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/EmptyState';

export default function MemberDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(true);
  const [isLoadingReservations, setIsLoadingReservations] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  useEffect(() => {
    async function loadData() {
      setIsLoadingSpaces(true);
      try {
        const res = await getSpaces();
        if (res.status && Array.isArray(res.data)) {
          setSpaces(res.data);
        }
      } finally {
        setIsLoadingSpaces(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadReservations() {
      if (!isAuthenticated) {
        setIsLoadingReservations(false);
        return;
      }
      setIsLoadingReservations(true);
      try {
        const res = await getMyReservations();
        if (res.status && Array.isArray(res.data)) {
          setReservations(res.data);
        }
      } finally {
        setIsLoadingReservations(false);
      }
    }
    loadReservations();
  }, [isAuthenticated]);

  // Find nearest upcoming/active reservation
  const activeReservation = useMemo(() => {
    if (!reservations || reservations.length === 0) return null;
    // prioritize disetujui or aktif, then belum_dikonfirm
    const active = reservations.find((r) => r.status === 'disetujui' || r.status === 'aktif');
    if (active) return active;
    return reservations.find((r) => r.status === 'belum_dikonfirm') || null;
  }, [reservations]);

  const activeCount = useMemo(() => {
    return reservations.filter(
      (r) => r.status === 'belum_dikonfirm' || r.status === 'disetujui' || r.status === 'aktif'
    ).length;
  }, [reservations]);

  const filteredSpaces = useMemo(() => {
    if (selectedType === 'all') return spaces.slice(0, 6);
    return spaces.filter((s) => s.tipe === selectedType).slice(0, 6);
  }, [spaces, selectedType]);

  const handleCopyPromo = () => {
    navigator.clipboard.writeText('DISKONHEMAT20');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Personalized Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/90 p-6 sm:p-8 md:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(197,168,128,0.12),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                {todayFormatted}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                {greeting},{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfcbb5] via-white to-zinc-200">
                  {user?.nama || 'Member'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed font-normal">
                Selamat datang di platform workspace Smart Space. Kelola sesi reservasi, akses e-ticket digital, atau reservasi workstation favorit Anda.
              </p>
            </div>

            {user?.instansi && (
              <div className="inline-flex items-center gap-2 text-xs text-zinc-400 font-mono pt-1">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Instansi: <span className="text-zinc-200 font-medium">{user.instansi}</span></span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link href="/member/spaces" className="w-full sm:w-auto">
              <Button size="md" variant="primary" className="w-full" rightIcon={<Compass className="w-4 h-4" />}>
                Pesan Ruang Baru
              </Button>
            </Link>
            <Link href="/member/reservations" className="w-full sm:w-auto">
              <Button size="md" variant="outline" className="w-full" rightIcon={<Ticket className="w-4 h-4" />}>
                Tiket Saya ({activeCount})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-luxury p-5 rounded-2xl flex items-center justify-between group hover:border-[#c5a880]/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Reservasi Aktif
            </span>
            <div className="text-2xl font-bold text-white font-mono flex items-center gap-2">
              {isLoadingReservations ? '-' : activeCount}
              {activeCount > 0 && (
                <span className="inline-block w-2 h-2 rounded-full  animate-pulse" />
              )}
            </div>
            <Link
              href="/member/reservations"
              className="inline-flex items-center gap-1 text-[11px] text-[#c5a880] hover:underline font-mono"
            >
              Lihat Tiket <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#c5a880] group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-luxury p-5 rounded-2xl flex items-center justify-between group hover:border-[#c5a880]/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Total Riwayat
            </span>
            <div className="text-2xl font-bold text-white font-mono">
              {isLoadingReservations ? '-' : reservations.length} Sesi
            </div>
            <Link
              href="/member/history"
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white font-mono"
            >
              Buka Riwayat <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Active Promo Voucher */}
        <div className="card-luxury p-5 rounded-2xl flex items-center justify-between group hover:border-[#c5a880]/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#c5a880] uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3" /> Voucher Promo 20%
            </span>
            <div className="text-sm font-bold text-white font-mono">
              DISKONHEMAT20
            </div>
            <button
              onClick={handleCopyPromo}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-[#dfcbb5] font-mono"
            >
              {copiedPromo ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#c5a880] group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Member Status */}
        <div className="card-luxury p-5 rounded-2xl flex items-center justify-between group hover:border-[#c5a880]/40 transition-all">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Status Keanggotaan
            </span>
            <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified Member
            </div>
            <Link
              href="/member/profile"
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white font-mono"
            >
              Edit Profil <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Session Spotlight Banner */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#c5a880]" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sesi & Tiket Kerja Aktif
            </h2>
          </div>
          <Link
            href="/member/reservations"
            className="text-xs text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1 font-mono"
          >
            Lihat Semua Tiket <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoadingReservations ? (
          <LoadingSkeleton rows={2} />
        ) : activeReservation ? (
          <div className="card-luxury rounded-3xl p-6 sm:p-7 border border-zinc-800 relative overflow-hidden bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              {/* Left Details */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={activeReservation.status} />
                  <Badge variant="outline" size="sm">
                    {getSpaceTypeLabel(activeReservation.space?.tipe || 'desk')}
                  </Badge>
                  <span className="text-xs font-mono text-zinc-400">
                    ID #{activeReservation.id_reservasi ?? activeReservation.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeReservation.space?.nama_space || 'Workstation Space'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {activeReservation.space?.deskripsi || 'Sesi kerja terdaftar di fasilitas Smart Space.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/80">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Tanggal Sesi</span>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                      {formatDate(activeReservation.tanggal_reservasi)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Waktu Kerja</span>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-200 font-mono">
                      {activeReservation.jam_mulai} - {calculateEndTime(activeReservation.jam_mulai, activeReservation.durasi_jam)}
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      ({activeReservation.durasi_jam} Jam)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Total Biaya</span>
                    <span className="text-xs sm:text-sm font-bold text-[#dfcbb5] font-mono">
                      {formatIDR(activeReservation.total_bayar ?? activeReservation.total_harga ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right CTA Action with Live QR */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-center items-center lg:items-end gap-4 pt-4 lg:pt-0 lg:border-l lg:border-zinc-800/80 lg:pl-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-lg border-2 border-white shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                        JSON.stringify({
                          id_reservasi: activeReservation.id_reservasi ?? activeReservation.id,
                          kode_booking: `SSB-${String(activeReservation.id_reservasi ?? activeReservation.id).padStart(6, '0')}`,
                          space: activeReservation.space?.nama_space,
                          tanggal: activeReservation.tanggal_reservasi,
                          jam: activeReservation.jam_mulai,
                          status: activeReservation.status,
                        })
                      )}&bgcolor=ffffff&color=000000&margin=0`}
                      alt="QR Access Pass"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-contain rounded"
                    />
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-mono text-[#c5a880] uppercase block">
                      QR Pass Siap
                    </span>
                    <span className="text-xs font-semibold text-white block">
                      Akses Gate 24/7
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      Scan di scanner venue
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-1.5">
                  <Link href={`/member/reservations/${activeReservation.id_reservasi ?? activeReservation.id}/ticket`} className="w-full block">
                    <Button size="sm" variant="primary" className="w-full" rightIcon={<Ticket className="w-4 h-4" />}>
                      Buka E-Ticket Lengkap
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-luxury rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-zinc-800/80">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-semibold text-white">
                Belum Ada Reservasi Aktif
              </h3>
              <p className="text-xs text-zinc-400">
                Anda belum memiliki pemesanan aktif hari ini. Reservasi meja kerja atau meeting room untuk produktivitas Anda berikutnya.
              </p>
            </div>
            <Link href="/member/spaces">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Jelajahi & Reservasi Ruang
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Curated Workspaces & Quick Booking Catalog */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[#c5a880] uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Pilihan Fasilitas Workspace
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Koleksi Ruang Kerja Terkurasi
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: 'Semua Ruang' },
              { key: 'desk', label: 'Personal Desk' },
              { key: 'meeting_room', label: 'Meeting Room' },
              { key: 'private_office', label: 'Private Office' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedType(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedType === f.key
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingSpaces ? (
          <LoadingSkeleton rows={3} />
        ) : filteredSpaces.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs card-luxury rounded-2xl">
            Tidak ada ruang pada kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => {
              const spaceId = space.id_space ?? space.id ?? 1;
              return (
                <div
                  key={spaceId}
                  className="card-luxury rounded-2xl overflow-hidden group flex flex-col justify-between border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <div>
                    {/* Image preview */}
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
                      <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-[#dfcbb5] transition-colors line-clamp-1">
                        {space.nama_space}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {space.deskripsi}
                      </p>

                      <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Kapasitas {space.kapasitas} Orang</span>
                        </div>
                        <span className="text-[11px] text-zinc-400">
                          AC & Power Outlet
                        </span>
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
                      <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Pesan Ruang
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/member/spaces">
            <Button size="md" variant="outline" rightIcon={<Compass className="w-4 h-4" />}>
              Lihat Seluruh Katalog Ruang ({spaces.length} Ruangan)
            </Button>
          </Link>
        </div>
      </div>

      {/* Member Exclusive Amenities & Facilities Guide */}
      <div className="card-luxury rounded-3xl p-6 sm:p-8 border border-zinc-800 space-y-6 bg-zinc-950/60">
        <div className="max-w-xl space-y-1">
          <div className="text-xs font-mono text-[#c5a880] uppercase tracking-widest">
            Fasilitas Inklusif Member
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Standar Kenyamanan di Lokasi
          </h2>
          <p className="text-xs text-zinc-400">
            Setiap reservasi ruang di Smart Space otomatis mendapatkan hak akses fasilitas pendukung berikut:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
              <Wifi className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-white">WiFi 1 Gbps Fiber</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Koneksi simetris super cepat dengan backup multi-gateway untuk aktivitas tanpa jeda.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
              <Coffee className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-white">Artisan Brew Coffee</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Kopi arabika single origin dan artisan tea gratis sepuasnya di barista bar lantai 1.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
              <Ticket className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-white">Instant QR Access</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Check-in mandiri langsung via scanner pintu menggunakan E-Ticket pada smartphone Anda.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-white">Loker & Keamanan 24/7</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Penyimpanan barang pribadi aman dengan sistem PIN dan pengawasan CCTV berkala.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
