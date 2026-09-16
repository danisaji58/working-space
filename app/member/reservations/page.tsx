'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Ticket,
  Ban,
  Sparkles,
  Plus,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { getMyReservations, cancelReservation } from '@/lib/api/reservations';
import { Reservation } from '@/types/api';
import { useAuth } from '@/context/auth-context';
import { formatIDR, formatDate, calculateEndTime, getSpaceTypeLabel, resolveSpaceImage } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, LoadingSkeleton } from '@/components/ui/EmptyState';

export default function MyReservationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getMyReservations();
      if (res.status && Array.isArray(res.data)) {
        setReservations(res.data);
        setApiError(null);
      } else {
        setApiError(res.message || 'Gagal memuat reservasi dari server.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const targetId = cancelTarget.id_reservasi ?? cancelTarget.id ?? 0;
    setIsCancelling(true);
    try {
      const res = await cancelReservation(targetId);
      if (res.status) {
        setActionMessage(`Reservasi #${targetId} berhasil dibatalkan.`);
        setCancelTarget(null);
        await fetchReservations();
      } else {
        setActionMessage(res.message || 'Gagal membatalkan reservasi.');
      }
    } finally {
      setIsCancelling(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Reservasi Aktif Saya
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Daftar sesi coworking space yang sedang menunggu konfirmasi, disetujui, atau sedang aktif berlangsung.
          </p>
        </div>

        <Link href="/member/spaces">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Pesan Ruang Baru
          </Button>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 flex items-center justify-between animate-in fade-in">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Unauthenticated state */}
      {!isAuthenticated ? (
        <div className="p-10 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-white">
            Silakan Masuk Terlebih Dahulu
          </h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Halaman ini menampilkan reservasi aktif akun member Anda. Masuk untuk melihat jadwal dan tiket QR Anda.
          </p>
          <Link href="/login">
            <Button variant="primary" size="sm">
              Masuk ke Akun
            </Button>
          </Link>
        </div>
      ) : apiError ? (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      ) : isLoading ? (
        <LoadingSkeleton rows={3} />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Tidak Ada Reservasi Aktif"
          description="Semua reservasi Anda telah selesai digunakan atau belum ada jadwal aktif yang dipesan."
          actionLabel="Jelajahi Ruang & Buat Reservasi"
          onAction={() => {
            router.push('/member/spaces');
          }}
        />
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const resId = res.id_reservasi ?? res.id ?? 1;
            const isCancellable =
              res.status === 'belum_dikonfirm' || res.status === 'disetujui';

            return (
              <div
                key={resId}
                className="card-luxury p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                    <Image
                      src={resolveSpaceImage(res.space || { foto: res.foto_space })}
                      alt={res.nama_space || 'Ruang'}
                      fill
                      unoptimized
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={res.status} />
                      <span className="text-xs text-zinc-400 font-mono">
                        Kode: SSB-{String(resId).padStart(6, '0')}
                      </span>
                      {res.tipe_space && (
                        <span className="text-[11px] text-zinc-400 font-mono">
                          • {getSpaceTypeLabel(res.tipe_space)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white tracking-tight">
                      {res.nama_space || 'Personal Workstation'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>{formatDate(res.tanggal_reservasi)}</span>
                      <span>•</span>
                      <span>
                        {res.jam_mulai} -{' '}
                        {calculateEndTime(res.jam_mulai, res.durasi_jam)} (
                        {res.durasi_jam} Jam)
                      </span>
                      <span>•</span>
                      <span className="text-white font-semibold">
                        {formatIDR(res.total_harga)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: QR + Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
                  {/* Inline QR Code */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="p-1.5 bg-white rounded-lg shadow">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                          JSON.stringify({
                            id: resId,
                            kode: `SSB-${String(resId).padStart(6, '0')}`,
                            space: res.nama_space,
                            tanggal: res.tanggal_reservasi,
                            jam: res.jam_mulai,
                            status: res.status,
                          })
                        )}&bgcolor=ffffff&color=000000&margin=0`}
                        alt={`QR Reservasi ${resId}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Scan QR</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <Link href={`/member/reservations/${resId}/ticket`}>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Ticket className="w-4 h-4" />}
                        className="w-full"
                      >
                        E-Ticket & QR
                      </Button>
                    </Link>
                    {isCancellable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancelTarget(res)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 w-full"
                      >
                        Batalkan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Batalkan Reservasi Ruang?"
        description="Tindakan ini akan membatalkan sesi reservasi Anda dan melepaskan ketersediaan ruang."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          {cancelTarget && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1 font-mono">
              <div className="text-white font-semibold">{cancelTarget.nama_space}</div>
              <div className="text-zinc-400">
                {formatDate(cancelTarget.tanggal_reservasi)} • {cancelTarget.jam_mulai} WIB
              </div>
              <div className="text-[#c5a880]">{formatIDR(cancelTarget.total_harga)}</div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCancelTarget(null)}
            >
              Kembali
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleConfirmCancel}
              leftIcon={<Ban className="w-3.5 h-3.5" />}
            >
              Ya, Batalkan Reservasi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
