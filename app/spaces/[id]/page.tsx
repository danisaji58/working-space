'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  Clock,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building,
  Check,
  AlertCircle,
  LogIn,
  MapPin,
  Phone,
} from 'lucide-react';
import { getSpaceById, checkSpaceAvailability } from '@/lib/api/spaces';
import { checkDiscount } from '@/lib/api/discounts';
import { createReservation } from '@/lib/api/reservations';
import { Space, Discount } from '@/types/api';
import { useAuth } from '@/context/auth-context';
import { formatIDR, getSpaceTypeLabel, calculatePrice, calculateEndTime, resolveSpaceImage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/EmptyState';
import { PublicNav } from '@/components/layout/public-nav';
import { MemberNav } from '@/components/layout/member-nav';

export default function PublicSpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = Number(params?.id);
  const { isAuthenticated } = useAuth();

  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reservation Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState<string>(todayStr);
  const [jamMulai, setJamMulai] = useState<string>('09:00');
  const [durasiJam, setDurasiJam] = useState<number>(3);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discountStatus, setDiscountStatus] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  // Space Availability Check (Endpoint 13)
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    status: 'idle' | 'checking' | 'available' | 'unavailable';
    message?: string;
  }>({ status: 'idle' });

  const handleCheckAvailability = async () => {
    if (!spaceId || !tanggal || !jamMulai || !durasiJam) return;
    setAvailabilityStatus({ status: 'checking' });
    try {
      const targetId = space?.id_space ?? space?.id ?? spaceId;
      const res = await checkSpaceAvailability({
        id_space: targetId,
        tanggal,
        jam_mulai: jamMulai,
        durasi_jam: durasiJam,
      });
      if (res.status && res.data?.available) {
        setAvailabilityStatus({
          status: 'available',
          message: res.message || 'Space tersedia untuk dipesan pada jadwal yang diminta',
        });
      } else {
        setAvailabilityStatus({
          status: 'unavailable',
          message: res.message || 'Maaf, space sudah terisi atau dibooking pada jam tersebut!',
        });
      }
    } catch {
      setAvailabilityStatus({
        status: 'unavailable',
        message: 'Gagal mengecek ketersediaan ke server.',
      });
    }
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<number | null>(null);

  useEffect(() => {
    async function loadSpace() {
      if (!spaceId) return;
      setIsLoading(true);
      try {
        const res = await getSpaceById(spaceId);
        if (res.status && res.data) {
          setSpace(res.data);
        } else {
          setError(res.message || 'Ruang tidak ditemukan.');
        }
      } catch (err) {
        setError('Gagal memuat detail ruang.');
      } finally {
        setIsLoading(false);
      }
    }
    loadSpace();
  }, [spaceId]);

  // Handle promo code verification against real API
  const handleCheckPromo = async () => {
    if (!promoCodeInput.trim()) {
      setDiscountStatus({ status: 'invalid', message: 'Masukkan kode promo terlebih dahulu.' });
      return;
    }

    setDiscountStatus({ status: 'checking' });
    try {
      const res = await checkDiscount(promoCodeInput.trim().toUpperCase());
      if (res.status && res.data) {
        setAppliedDiscount(res.data);
        setDiscountStatus({
          status: 'valid',
          message: `Kupon "${res.data.nama_diskon || promoCodeInput}" aktif! Diskon ${res.data.persentase_diskon}% diterapkan.`,
        });
      } else {
        setAppliedDiscount(null);
        setDiscountStatus({
          status: 'invalid',
          message: res.message || 'Kode kupon tidak valid atau sudah kedaluwarsa.',
        });
      }
    } catch {
      setDiscountStatus({
        status: 'invalid',
        message: 'Gagal memverifikasi kupon.',
      });
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not logged in, redirect to login with return path!
    if (!isAuthenticated) {
      router.push(`/login?redirect=/spaces/${spaceId}`);
      return;
    }

    const errors: Record<string, string> = {};
    if (!tanggal) errors.tanggal = 'Tanggal wajib ditentukan';
    if (!jamMulai) errors.jamMulai = 'Jam mulai wajib diisi';
    if (!durasiJam || durasiJam < 1) errors.durasiJam = 'Durasi minimal 1 jam';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const targetSpaceId = space?.id_space ?? space?.id ?? spaceId;
      const res = await createReservation({
        id_space: targetSpaceId,
        tanggal_reservasi: tanggal,
        jam_mulai: jamMulai,
        durasi_jam: durasiJam,
        id_diskon: appliedDiscount?.id_diskon ?? appliedDiscount?.id ?? null,
        kode_promo: appliedDiscount?.nama_diskon ?? null,
      });

      if (res.status && res.data) {
        const resId = res.data.id_reservasi ?? res.data.id ?? 999;
        setSubmitSuccess(resId);
        setTimeout(() => {
          router.push(`/member/reservations`);
        }, 1800);
      } else {
        setFormErrors({ submit: res.message || 'Gagal memproses reservasi. Coba lagi.' });
      }
    } catch {
      setFormErrors({ submit: 'Terjadi kesalahan sistem saat menghubungi server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col">
        {isAuthenticated ? <MemberNav /> : <PublicNav />}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={5} />
        </main>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col">
        {isAuthenticated ? <MemberNav /> : <PublicNav />}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card-luxury p-8 rounded-2xl max-w-lg mx-auto text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Ruang Tidak Ditemukan</h2>
            <p className="text-xs text-zinc-400">
              {error || 'Data ruang kerja dengan ID tersebut tidak dapat dimuat atau belum tersedia.'}
            </p>
            <Link href="/spaces">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Kembali ke Katalog Ruang
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const hourlyPrice = space.harga_per_jam || 0;
  const discountPercent = appliedDiscount?.persentase_diskon || 0;
  const { basePrice, discountAmount, finalPrice } = calculatePrice(
    hourlyPrice,
    durasiJam,
    discountPercent
  );
  const jamSelesai = calculateEndTime(jamMulai, durasiJam);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col selection:bg-[#c5a880]/30 selection:text-[#dfcbb5]">
      {/* Adaptive Header */}
      {isAuthenticated ? <MemberNav /> : <PublicNav />}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Link href="/spaces" className="hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Katalog Ruang</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-200 truncate max-w-xs">{space.nama_space}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Photo Showcase & Room Features */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Picture Frame */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <Image
                src={resolveSpaceImage(space)}
                alt={space.nama_space}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="accent" size="md">
                  {getSpaceTypeLabel(space.tipe)}
                </Badge>
                {space.owner?.nama_coworking && (
                  <span className="px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center gap-1">
                    <Building className="w-3 h-3 text-[#c5a880]" />
                    {space.owner.nama_coworking}
                  </span>
                )}
              </div>
            </div>

            {/* Room Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {space.nama_space}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#c5a880]" />
                    <span>Kapasitas Hingga {space.kapasitas} Orang</span>
                  </div>
                  {space.owner?.telp && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Kontak: {space.owner.telp}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Deskripsi Ruang
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {space.deskripsi || 'Ruang kerja premium dengan fasilitas lengkap dan kenyamanan maksimal.'}
                </p>
              </div>
            </div>

            {/* Amenities Breakdown */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c5a880]" />
                <span>Fasilitas & Kelengkapan Termasuk</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(space.fasilitas && space.fasilitas.length > 0
                  ? space.fasilitas
                  : [
                      'Kursi Ergonomis',
                      'Dedicated High-Speed WiFi (1 Gbps)',
                      'Stopkontak Meja Personal',
                      'Free Flow Artisan Coffee & Tea',
                      'AC Sentral Dingin',
                      'Akses Keycard Digital',
                    ]
                ).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[#c5a880] shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Reservation Sheet */}
          <div className="lg:col-span-5">
            <div className="card-luxury p-6 sm:p-7 rounded-2xl sticky top-24 space-y-5">
              <div className="flex items-start justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                    Tarif Sewa
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-white">
                      {formatIDR(space.harga_per_jam)}
                    </span>
                    <span className="text-xs text-zinc-400">/jam</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Jaminan Reservasi</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">Konfirmasi Instan</span>
                </div>
              </div>

              {submitSuccess ? (
                <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="text-sm font-bold text-white">Reservasi Berhasil!</h3>
                  <p className="text-xs text-zinc-300">
                    ID Reservasi: <span className="font-mono text-white">#{submitSuccess}</span>.
                    Mengalihkan ke E-Ticket...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {formErrors.submit && (
                    <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-2">
                      <div>{formErrors.submit}</div>
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="p-3 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/25 text-xs text-[#dfcbb5] flex items-start gap-2.5">
                      <LogIn className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-semibold text-white">Ingin memesan ruang ini?</span> Anda dapat menentukan jadwal & cek ketersediaan sekarang. Anda akan diarahkan login saat konfirmasi pemesanan.
                      </div>
                    </div>
                  )}

                  {/* Reservation Date */}
                  <Input
                    label="Tanggal Reservasi"
                    type="date"
                    min={todayStr}
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    error={formErrors.tanggal}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />

                  {/* Start Time & Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Jam Mulai"
                      type="time"
                      required
                      value={jamMulai}
                      onChange={(e) => setJamMulai(e.target.value)}
                      error={formErrors.jamMulai}
                      leftIcon={<Clock className="w-4 h-4" />}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-zinc-300">
                        Durasi (Jam) <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={durasiJam}
                        onChange={(e) => setDurasiJam(Number(e.target.value))}
                        className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-100 text-sm px-3.5 py-2.5 focus:outline-none focus:border-zinc-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            {num} Jam
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Schedule Summary Banner */}
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
                    <span>Waktu Selesai:</span>
                    <span className="text-white font-semibold">{jamSelesai} WIB</span>
                  </div>

                  {/* Live Space Availability Verification (Endpoint 13) */}
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
                        Status Slot (Live API)
                      </span>
                      <button
                        type="button"
                        onClick={handleCheckAvailability}
                        disabled={availabilityStatus.status === 'checking'}
                        className="text-[11px] font-mono text-[#c5a880] hover:text-[#d4be9d] underline cursor-pointer disabled:opacity-50"
                      >
                        {availabilityStatus.status === 'checking' ? 'Mengecek...' : 'Cek Ketersediaan'}
                      </button>
                    </div>

                    {availabilityStatus.status === 'available' && (
                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-[11px] text-emerald-300 flex items-center gap-2 animate-in fade-in">
                        <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        <span>{availabilityStatus.message}</span>
                      </div>
                    )}

                    {availabilityStatus.status === 'unavailable' && (
                      <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/50 text-[11px] text-rose-300 flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        <span>{availabilityStatus.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Promo Code Verification */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-medium text-zinc-300">
                      Kode Kupon / Diskon (Opsional)
                    </label>

                    {appliedDiscount ? (
                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                          <Tag className="w-3.5 h-3.5" />
                          <span>
                            {appliedDiscount.nama_diskon} (-{appliedDiscount.persentase_diskon}%)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedDiscount(null);
                            setPromoCodeInput('');
                            setDiscountStatus({ status: 'idle' });
                          }}
                          className="text-[10px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Contoh: DISKONHEMAT20"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 font-mono uppercase"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleCheckPromo}
                          isLoading={discountStatus.status === 'checking'}
                        >
                          Terapkan
                        </Button>
                      </div>
                    )}

                    {discountStatus.message && (
                      <p
                        className={`text-[11px] ${
                          discountStatus.status === 'valid'
                            ? 'text-emerald-400'
                            : discountStatus.status === 'invalid'
                            ? 'text-rose-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {discountStatus.message}
                      </p>
                    )}
                  </div>

                  {/* Live Price Breakdown */}
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>
                        {formatIDR(hourlyPrice)} × {durasiJam} Jam
                      </span>
                      <span className="font-mono">{formatIDR(basePrice)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>Potongan Promo ({discountPercent}%)</span>
                        <span className="font-mono">-{formatIDR(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-sm font-bold text-white">
                      <span>Total Pembayaran</span>
                      <span className="font-mono text-base text-[#dfcbb5]">
                        {formatIDR(finalPrice)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    isLoading={isSubmitting}
                  >
                    {isAuthenticated ? 'Konfirmasi & Bayar Reservasi' : 'Masuk untuk Konfirmasi Reservasi'}
                  </Button>
                </form>
              )}

              <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                Dengan mengonfirmasi reservasi, data pemesanan dikirimkan secara langsung ke official API coworking space.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 mt-16 text-center text-xs text-zinc-500">
        <p>© 2026 Smart Space Coworking. Semua hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
