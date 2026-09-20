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
  CheckCircle2,
  QrCode,
  Monitor,
  Zap,
  ChevronDown,
  LayoutDashboard,
  Check,
  Building,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PublicNav } from '@/components/layout/public-nav';
import { useAuth } from '@/context/auth-context';
import { getSpaces } from '@/lib/api/spaces';
import { Space } from '@/types/api';
import { formatIDR, getSpaceTypeLabel, resolveSpaceImage } from '@/lib/utils';

export default function LandingPage() {
  const { isAuthenticated, user, role } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setIsLoadingSpaces(true);
    getSpaces()
      .then((res) => {
        if (res.status && res.data) {
          setSpaces(res.data);
        }
      })
      .finally(() => {
        setIsLoadingSpaces(false);
      });
  }, []);

  const filteredSpaces = spaces.filter((s) => {
    if (selectedType === 'all') return true;
    return s.tipe === selectedType;
  }).slice(0, 3);

  const faqs = [
    {
      q: 'Bagaimana cara melakukan reservasi ruang di Smart Space?',
      a: 'Pilih ruang kerja yang Anda inginkan pada katalog, tentukan tanggal serta jam pemesanan, dan konfirmasi. Setelah disetujui, Anda akan mendapatkan E-Ticket digital lengkap dengan QR code untuk akses langsung.',
    },
    {
      q: 'Fasilitas apa saja yang sudah termasuk dalam tarif sewa?',
      a: 'Setiap reservasi sudah mencakup koneksi internet dedicated fiber optic 1 Gbps, akses artisan coffee & tea tanpa batas, kursi ergonomis, colokan listrik per meja, dan ruang ber-AC yang nyaman.',
    },
    {
      q: 'Bagaimana alur check-in saat saya tiba di lokasi?',
      a: 'Cukup buka E-Ticket digital di akun Anda dan tunjukkan QR Code pada resepsionis atau scanner pintu pintar. Anda dapat langsung menempati workstation yang telah dipesan tanpa antrean.',
    },
    {
      q: 'Apakah saya bisa membatalkan jadwal yang telah dibuat?',
      a: 'Tentu. Anda dapat membatalkan reservasi yang belum berjalan langsung melalui menu "Reservasi Saya" di dashboard akun member Anda.',
    },
    {
      q: 'Apakah non-member harus mendaftar akun terlebih dahulu?',
      a: 'Ya, pendaftaran akun member gratis dan hanya membutuhkan waktu kurang dari 1 menit agar tiket digital dan riwayat pemesanan Anda tersimpan dengan aman.',
    },
  ];

  const handleCopyPromo = () => {
    navigator.clipboard.writeText('DISKONHEMAT20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col selection:bg-[#c5a880]/30 selection:text-[#dfcbb5]">
      {/* Dedicated Public Navbar */}
      <PublicNav />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden border-b border-zinc-900">
        {/* Subtle radial architectural spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-275 h-137.5 bg-[radial-gradient(ellipse_at_top,rgba(197,168,128,0.09),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Ruang Kerja Presisi. <br />
              <span className="text-zinc-400 font-normal">Fokus Tanpa Kompromi.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl font-normal">
              Platform reservasi workstation, ruang rapat eksekutif, dan private office premium. Nikmati konektivitas gigabit simetris, akustik kedap suara, dan kursi ergonomis untuk produktivitas optimal Anda.
            </p>

            {/* Dynamic CTAs based on login status */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  <Link href={role === 'admin_space' ? '/admin' : '/member'}>
                    <Button size="lg" variant="primary" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                      Buka Dashboard
                    </Button>
                  </Link>
                  <Link href={role === 'admin_space' ? '/admin/spaces' : '/spaces'}>
                    <Button size="lg" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Jelajah Ruang
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/spaces">
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Jelajah Katalog Ruang
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

      {/* Featured Spaces Collection Section */}
      <section id="katalog" className="py-20 md:py-28 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-[#c5a880] uppercase tracking-widest mb-1">
                Koleksi Ruang Terkurasi
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Pilihan Workstation & Atelier
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Dirancang khusus untuk fokus mandiri maupun kolaborasi tim dengan fleksibilitas durasi per jam.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 shrink-0">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'desk', label: 'Desk' },
                { id: 'meeting_room', label: 'Meeting' },
                { id: 'private_office', label: 'Office' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedType === tab.id
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {isLoadingSpaces ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-luxury rounded-2xl overflow-hidden p-5 space-y-4 animate-pulse">
                  <div className="aspect-[16/10] bg-zinc-800/60 rounded-xl" />
                  <div className="h-5 bg-zinc-800/80 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800/50 rounded w-full" />
                  <div className="h-3 bg-zinc-800/40 rounded w-2/3" />
                  <div className="pt-3 border-t border-zinc-800/60 flex justify-between items-center">
                    <div className="h-4 bg-zinc-800/70 rounded w-24" />
                    <div className="h-8 bg-zinc-800/80 rounded-lg w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSpaces.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-400">Belum ada ruang pada kategori ini.</p>
              <Link href="/spaces">
                <Button size="sm" variant="outline">Lihat Semua di Katalog</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredSpaces.map((space) => {
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
                        <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-[#dfcbb5] transition-colors line-clamp-1">
                          {space.nama_space}
                        </h3>

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

                      <Link href={`/spaces/${spaceId}`}>
                        <Button size="sm" variant="primary">
                          Lihat Detail & Pesan
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-all"
            >
              <span>Jelajahi Seluruh Koleksi Ruang di Katalog</span>
              <ChevronRight className="w-4 h-4 text-[#c5a880]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Booking Flow Section */}
      <section id="cara-pesan" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <div className="text-xs font-mono text-[#c5a880] uppercase tracking-widest mb-1">
              Alur Cepat & Praktis
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Reservasi Meja & Ruangan dalam 3 Langkah
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Tidak ada antrean rumit. Dapatkan akses tempat kerja profesional dalam hitungan menit secara digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] font-mono font-bold text-sm">
                01
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-white">Pilih Ruang & Jadwal</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tentukan jenis workstation atau meeting room sesuai kapasitas yang dibutuhkan. Pilih tanggal dan durasi jam kerja secara fleksibel.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] font-mono font-bold text-sm">
                02
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-white">Konfirmasi & E-Ticket Digital</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Pemesanan langsung tercatat dan terverifikasi. Anda langsung mendapatkan E-Ticket digital resmi lengkap dengan QR Code check-in.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] font-mono font-bold text-sm">
                03
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-white">Scan QR & Langsung Bekerja</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tiba di lokasi, scan QR Code pada gerbang akses atau resepsionis. Nikmati kopi artisan gratis dan mulai sesi kerja tanpa hambatan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & Architectural Value Section */}
      <section id="fasilitas" className="py-20 md:py-28 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <div className="text-xs font-mono text-[#c5a880] uppercase tracking-widest mb-1">
              Standar Fasilitas
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Didesain untuk Performa, Fokus & Ketelitian
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Setiap sudut ruang kerja dirancang dengan standar akustik terbaik, ergonomi bersertifikasi, dan keandalan daya cadangan tanpa henti.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <Wifi className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Dedicated Fiber Optic</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Jaringan simetris ultra low-latency dengan backup multi-ISP untuk coding, upload dataset besar, dan telekonferensi 4K.
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
                <QrCode className="w-5 h-5" />
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
                Sistem smart lock keycard, pengawasan CCTV cloud 24 jam, dan loker penyimpanan pribadi dengan sensor RFID.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Display & Konferensi 4K</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ruang rapat dilengkapi layar presentasi 4K HDR, wireless casting, microphone array 360°, dan webcam wide-angle.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Uninterrupted Power (UPS)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sistem kelistrikan stabil dengan genset cadangan otomatis dan proteksi lonjakan arus di setiap colokan workstation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Kursi Ergonomis Premium</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Dilengkapi lumbar support yang dapat disesuaikan dan material mesh breathable untuk kenyamanan kerja maraton seharian.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-[#c5a880]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Fleksibilitas Jam Sewa</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bayar hanya untuk durasi yang Anda butuhkan tanpa biaya tersembunyi. Mulai dari 1 jam hingga langganan harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Special Section */}
      <section id="promo" className="py-20 md:py-24 border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-luxury p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-zinc-800/80">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-[#c5a880]/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-3 text-center md:text-left max-w-lg">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Nikmati Diskon 20% untuk Reservasi Pertama Anda
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Gunakan kode kupon berikut pada formulir pemesanan untuk mendapatkan potongan harga langsung di sesi kerja pertama Anda.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 p-2 px-4 rounded-xl bg-zinc-950 border border-zinc-700/80 font-mono text-base font-bold text-[#dfcbb5]">
                  <span>DISKONHEMAT20</span>
                  <button
                    onClick={handleCopyPromo}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Salin Kode"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Salin'}
                  </button>
                </div>
                <Link href="/spaces">
                  <Button size="md" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Gunakan Kupon Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" className="py-20 md:py-28 border-b border-zinc-900 bg-zinc-950/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <div className="text-xs font-mono text-[#c5a880] uppercase tracking-widest">
              Pusat Informasi
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Temukan jawaban cepat seputar pemesanan, fasilitas, dan ketentuan penggunaan ruang kerja.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-[#dfcbb5] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#c5a880]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Final Banner */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-luxury p-8 sm:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-xl mx-auto space-y-3 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Siap untuk Sesi Kerja yang Lebih Produktif?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Pilih meja atau ruang rapat favorit Anda sekarang. Daftarkan diri sebagai member untuk akses instan kapan pun Anda membutuhkan tempat kerja.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 relative z-10">
              <Link href="/spaces">
                <Button size="lg" variant="primary" rightIcon={<Compass className="w-4 h-4" />}>
                  {isAuthenticated ? 'Mulai Reservasi Ruang' : 'Jelajahi Katalog Ruang'}
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/register/member">
                  <Button size="lg" variant="outline">
                    Daftar Sebagai Member
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Editorial Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {/* Logo & Description */}
            <div className="space-y-3 max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold font-mono text-xs">
                  SS
                </div>
                <span className="font-semibold text-white tracking-tight">SMART SPACE BOOKING</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Platform reservasi ruang kerja modern dengan sistem presisi digital, akses QR instan, dan fasilitas premium untuk mendukung profesionalisme Anda.
              </p>
              <div className="text-[11px] text-zinc-500 font-mono">
                UKK Rekayasa Perangkat Lunak • SMK Telkom
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-mono">
              <div className="space-y-3">
                <div className="text-zinc-200 uppercase font-semibold">Navigasi</div>
                <ul className="space-y-2 text-zinc-400">
                  <li><Link href="/#katalog" className="hover:text-white transition-colors">Pilihan Ruang</Link></li>
                  <li><Link href="/#fasilitas" className="hover:text-white transition-colors">Fasilitas</Link></li>
                  <li><Link href="/#cara-pesan" className="hover:text-white transition-colors">Cara Kerja</Link></li>
                  <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-zinc-200 uppercase font-semibold">Akses Member</div>
                <ul className="space-y-2 text-zinc-400">
                  <li><Link href="/login" className="hover:text-white transition-colors">Masuk Akun</Link></li>
                  <li><Link href="/register/member" className="hover:text-white transition-colors">Daftar Baru</Link></li>
                  <li><Link href="/spaces" className="hover:text-white transition-colors">Katalog Ruang</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-zinc-200 uppercase font-semibold">Jam Buka</div>
                <ul className="space-y-2 text-zinc-400">
                  <li>Senin - Jumat: 07:00 - 22:00</li>
                  <li>Sabtu - Minggu: 08:00 - 20:00</li>
                  <li className="text-[#c5a880]">24/7 Access for Keycard Members</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
            <div>© {new Date().getFullYear()} Smart Space Coworking. Hak Cipta Dilindungi.</div>
            <div className="flex items-center gap-6">
              <span>Keamanan Terenkripsi</span>
              <span>•</span>
              <span>Instant QR Check-In</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
