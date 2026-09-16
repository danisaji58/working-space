'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Ticket,
  Ban,
  AlertCircle,
  ShieldCheck,
  QrCode,
  Building,
  Printer
} from 'lucide-react';
import { getReservationById, cancelReservation } from '@/lib/api/reservations';
import { Reservation } from '@/types/api';
import { formatIDR, formatDate, calculateEndTime, getSpaceTypeLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/EmptyState';

export default function ReservationDetailPage() {
  const params = useParams();
  const reservationId = Number(params?.id);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!reservationId) return;
    setIsLoading(true);
    try {
      const res = await getReservationById(reservationId);
      if (res.status && res.data) {
        setReservation(res.data);
      } else {
        setError(res.message || 'Reservasi tidak ditemukan.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancel = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) return;
    setIsCancelling(true);
    try {
      const res = await cancelReservation(reservationId);
      if (res.status) {
        await loadData();
      } else {
        alert(res.message || 'Gagal membatalkan reservasi');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Reservasi Tidak Ditemukan</h2>
        <p className="text-xs text-zinc-400">{error}</p>
        <Link href="/member/reservations">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Kembali ke Daftar Reservasi
          </Button>
        </Link>
      </div>
    );
  }

  const isCancellable =
    reservation.status === 'belum_dikonfirm' || reservation.status === 'disetujui';

  const resId = reservation.id_reservasi ?? reservation.id ?? reservationId;

  const qrDataString = JSON.stringify({
    id_reservasi: resId,
    kode_booking: `SSB-${String(resId).padStart(6, '0')}`,
    space: reservation.nama_space,
    tanggal: reservation.tanggal_reservasi,
    jam: `${reservation.jam_mulai} (${reservation.durasi_jam} Jam)`,
    status: reservation.status,
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    qrDataString
  )}&bgcolor=ffffff&color=000000&margin=2`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/member/reservations"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Reservasi</span>
        </Link>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="card-luxury p-6 sm:p-8 rounded-3xl space-y-6 border border-zinc-800">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="text-xs font-mono text-[#c5a880] uppercase tracking-wider">
              Kode Booking: SSB-{String(resId).padStart(6, '0')}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              {reservation.nama_space || 'Workstation Space'}
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Tipe: {getSpaceTypeLabel(reservation.tipe_space || 'desk')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/member/reservations/${resId}/ticket`}>
              <Button variant="primary" size="md" leftIcon={<Ticket className="w-4 h-4" />}>
                Buka E-Ticket Digital
              </Button>
            </Link>
          </div>
        </div>

        {/* Schedule & Timing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Tanggal Booking</span>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c5a880]" />
              <span>{formatDate(reservation.tanggal_reservasi)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Waktu Pemakaian</span>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c5a880]" />
              <span>
                {reservation.jam_mulai} -{' '}
                {calculateEndTime(reservation.jam_mulai, reservation.durasi_jam)} WIB (
                {reservation.durasi_jam} Jam)
              </span>
            </div>
          </div>
        </div>

        {/* Prominent QR Code Section */}
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Akses QR Code Reservasi</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Gunakan kode QR ini saat tiba di lokasi untuk validasi check-in mandiri dan aktivasi workstation Anda.
            </p>
            <div className="pt-2">
              <Link href={`/member/reservations/${resId}/ticket`}>
                <Button variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
                  Unduh / Cetak Tiket Lengkap
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt={`QR Code #${resId}`}
                width={120}
                height={120}
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
              />
            </div>
            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <QrCode className="w-3 h-3 text-[#c5a880]" />
              Scan QR Check-In
            </span>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
            Rincian Biaya
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Tarif per jam:</span>
              <span className="font-mono">{formatIDR(reservation.harga_per_jam || 0)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Durasi pemakaian:</span>
              <span className="font-mono">{reservation.durasi_jam} Jam</span>
            </div>
            {reservation.kode_promo && (
              <div className="flex justify-between text-emerald-400">
                <span>Kode Promo ({reservation.kode_promo}):</span>
                <span className="font-mono">
                  {reservation.persentase_diskon ? `Hemat ${reservation.persentase_diskon}%` : 'Diskon'}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800 font-mono">
              <span>Total Pembayaran:</span>
              <span className="text-[#dfcbb5]">{formatIDR(reservation.total_harga)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isCancellable && (
          <div className="pt-2 flex justify-end">
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleCancel}
              leftIcon={<Ban className="w-4 h-4" />}
            >
              Batalkan Reservasi Ini
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
