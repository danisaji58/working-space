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

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = Number(params?.id);
  const { user, isAuthenticated } = useAuth();

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
      const res = await checkDiscount(promoCodeInput.trim());
      if (res.status && res.data) {
        setAppliedDiscount(res.data);
        setDiscountStatus({
          status: 'valid',
          message: res.message || `Kode "${res.data.nama_diskon}" valid! Hemat ${res.data.persentase_diskon}%.`,
        });
      } else {
        setAppliedDiscount(null);
        setDiscountStatus({
          status: 'invalid',
          message: res.message || 'Kode promo tidak valid.',
        });
      }
    } catch {
      setAppliedDiscount(null);
      setDiscountStatus({
        status: 'invalid',
        message: 'Gagal memverifikasi kode promo ke server.',
      });
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setPromoCodeInput('');
    setDiscountStatus({ status: 'idle' });
  };

  // Price Calculation Engine
  const hourlyPrice = space?.harga_per_jam || 0;
  const discountPercent = appliedDiscount ? appliedDiscount.persentase_diskon : 0;
  const { basePrice, discountAmount, finalPrice } = calculatePrice(
    hourlyPrice,
    durasiJam,
    discountPercent
  );

  const jamSelesai = calculateEndTime(jamMulai, durasiJam);

  // Form submission
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!isAuthenticated) {
      errors.submit = 'Anda harus login terlebih dahulu sebelum membuat reservasi.';
      setFormErrors(errors);
      return;
    }

    if (!tanggal) errors.tanggal = 'Pilih tanggal reservasi';
    if (!jamMulai) errors.jamMulai = 'Pilih jam mulai';
    if (!durasiJam || durasiJam < 1) errors.durasiJam = 'Durasi minimal 1 jam';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const targetSpaceId = space?.id_space ?? space?.id ?? spaceId;
      const memberName =
        (user as { nama?: string; nama_member?: string; name?: string })?.nama ||
        (user as { nama_member?: string })?.nama_member ||
        (user as { name?: string })?.name ||
        user?.username ||
        'Member';
      const memberId = user?.id || (user as { id_member?: number })?.id_member || 101;

      const payload = {
        id_space: targetSpaceId,
        tanggal_reservasi: tanggal,
        jam_mulai: jamMulai,
        durasi_jam: durasiJam,
        id_diskon: appliedDiscount?.id_diskon ?? appliedDiscount?.id ?? null,
        kode_promo: appliedDiscount?.nama_diskon ?? null,
        id_member: memberId,
        nama_member: memberName,
        nama_space: space?.nama_space,
        tipe_space: space?.tipe,
        foto_space: space?.foto,
        harga_per_jam: space?.harga_per_jam,
      };

      const res = await createReservation(payload);

      if (res.status && res.data) {
        const createdId = res.data.id_reservasi ?? res.data.id;
        setSubmitSuccess(createdId || targetSpaceId);
        setTimeout(() => {
          router.push(`/member/reservations/${createdId}/ticket`);
        }, 1500);
      } else {
        setFormErrors({ submit: res.message || 'Gagal membuat reservasi.' });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFormErrors({ submit: error.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={2} />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white">Ruang Tidak Ditemukan</h2>
        <p className="text-xs text-zinc-400">{error}</p>
        <Link href="/member/spaces">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Kembali ke Katalog Ruang
          </Button>
        </Link>
      </div>
    );
  }

  const isAvailable = space.available !== false && space.tersedia !== false;

  return (
    <div className="space-y-8">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/member/spaces"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Ruang</span>
        </Link>
        <Badge variant="accent" size="sm">
          {getSpaceTypeLabel(space.tipe)}
        </Badge>
      </div>

      {/* Main Grid: Left Details & Right Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media & Specifications */}
        <div className="lg:col-span-7 space-y-6">
          {/* Large Hero Image */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl">
            <Image
              src={resolveSpaceImage(space)}
              alt={space.nama_space}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <Badge variant={isAvailable ? 'success' : 'danger'} size="md">
                {isAvailable ? 'Siap Direservasi' : 'Kapasitas Penuh'}
              </Badge>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {space.nama_space}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Kapasitas {space.kapasitas} Orang</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-zinc-400" />
                <span>Tipe: {getSpaceTypeLabel(space.tipe)}</span>
              </div>
              {space.owner?.nama_coworking && (
                <>
                  <span>•</span>
                  <span>{space.owner.nama_coworking}</span>
                </>
              )}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed pt-2">
              {space.deskripsi}
            </p>
          </div>

          {/* Amenities Breakdown */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Fasilitas & Kelengkapan Termasuk</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(space.fasilitas && space.fasilitas.length > 0
                ? space.fasilitas
                : [
                  'Kursi Ergonomis',
                  'High-Speed WiFi',
                  'Stopkontak Meja',
                  'Free Flow Kopi & Teh',
                  'AC Ruangan',
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
                    {!isAuthenticated && (
                      <Link href="/login" className="inline-block">
                        <Button size="sm" variant="primary" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                          Masuk ke Akun Anda
                        </Button>
                      </Link>
                    )}
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

                {/* Endpoint 13: Live Space Availability Verification */}
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
                      Status Ketersediaan Slot (Live API)
                    </span>
                    <button
                      type="button"
                      onClick={handleCheckAvailability}
                      disabled={availabilityStatus.status === 'checking'}
                      className="text-[11px] font-mono text-[#c5a880] hover:text-[#d4be9d] underline cursor-pointer disabled:opacity-50"
                    >
                      {availabilityStatus.status === 'checking' ? 'Mengecek...' : 'Cek Ketersediaan Slot'}
                    </button>
                  </div>

                  {availabilityStatus.status === 'available' && (
                    <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800/50 text-[11px] text-emerald-300 flex items-center gap-2 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>{availabilityStatus.message}</span>
                    </div>
                  )}

                  {availabilityStatus.status === 'unavailable' && (
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-[11px] text-emerald-300 flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{availabilityStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* Promo Code Checker Section */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Kode Promo / Diskon (Server Coworking)
                  </label>

                  {appliedDiscount ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="font-mono font-semibold">
                          {appliedDiscount.nama_diskon}
                        </span>
                        <span>(-{appliedDiscount.persentase_diskon}%)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: JOYCHAN"
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
                      className={`text-[11px] ${discountStatus.status === 'valid'
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
                  Konfirmasi & Bayar Reservasi
                </Button>
              </form>
            )}

            <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
              Dengan mengonfirmasi reservasi, data pemesanan dikirimkan secara langsung ke official API reservasi coworking space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
