'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { getETicket } from '@/lib/api/reservations';
import { ETicketData } from '@/types/api';
import { formatIDR, formatDate, getSpaceTypeLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSkeleton } from '@/components/ui/EmptyState';

export default function ETicketPage() {
  const params = useParams();
  const reservationId = Number(params?.id);

  const [ticket, setTicket] = useState<ETicketData | null>(null);
  const [qrPayload, setQrPayload] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTicket() {
      if (!reservationId) return;
      setIsLoading(true);
      try {
        const res = await getETicket(reservationId);
        if (res.status && res.data) {
          setTicket(res.data);
          // Store qr_payload to build a canvas-free QR image URL
          if (res.data.qr_payload) {
            setQrPayload(res.data.qr_payload);
          }
        } else {
          setError(res.message || 'E-Ticket tidak ditemukan.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadTicket();
  }, [reservationId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">E-Ticket Tidak Ditemukan</h2>
        <p className="text-xs text-zinc-400">{error}</p>
        <Link href="/member/reservations">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Kembali ke Reservasi Saya
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/member/reservations"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Reservasi</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak / Unduh PDF
          </Button>
        </div>
      </div>

      {/* Official Boarding-Pass Style E-Ticket Card */}
      <div className="ticket-container bg-zinc-900/90 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100">
        {/* Ticket Header Banner */}
        <div className="p-6 sm:p-8 bg-zinc-950 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-white text-zinc-950 font-bold font-mono text-xs flex items-center justify-center">
                SS
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">
                SMART SPACE BOOKING
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Official Coworking Pass & Receipt
            </h1>
            <p className="text-xs text-zinc-400">
              {ticket.coworking?.nama ?? 'Smart Space Coworking'} • {ticket.coworking?.alamat ?? 'Malang, Jawa Timur'}
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="text-[10px] uppercase font-mono text-zinc-400">Kode Booking</div>
            <div className="text-sm sm:text-base font-bold font-mono text-[#dfcbb5] tracking-wider">
              {ticket.kode_booking}
            </div>
            <div className="pt-1">
              <StatusBadge status={ticket.pembayaran?.status_reservasi ?? ticket.status ?? 'belum_dikonfirm'} />
            </div>
          </div>
        </div>

        {/* Schedule & Space Information */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-zinc-800/80">
            {/* Space details */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Ruang Kerja / Workstation
              </span>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {ticket.space?.nama ?? 'Workstation'}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Tipe: {getSpaceTypeLabel(ticket.space?.tipe ?? 'desk')} • Kapasitas: {ticket.space?.kapasitas ?? '-'} Orang
                </p>
              </div>
            </div>

            {/* Schedule details */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Jadwal Pemakaian
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Calendar className="w-4 h-4 text-[#c5a880]" />
                  <span>{formatDate(ticket.jadwal?.tanggal ?? '')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {ticket.jadwal?.jam_mulai ?? '-'} - {ticket.jadwal?.jam_selesai ?? '-'} WIB ({ticket.jadwal?.durasi_jam ?? '-'} Jam)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Member & Payment Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-zinc-800/80">
            {/* Member Info */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Identitas Pengunjung
              </span>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-white text-sm">
                  {ticket.member?.nama ?? '-'}
                </div>
                <div className="text-zinc-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{ticket.member?.instansi ?? '-'}</span>
                </div>
                <div className="text-zinc-400 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{ticket.member?.telp ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                Rincian Pembayaran
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400 font-mono">
                  <span>Biaya Dasar ({ticket.jadwal?.durasi_jam ?? '-'} jam):</span>
                  <span>{formatIDR(ticket.pembayaran?.harga_awal ?? 0)}</span>
                </div>
                {(ticket.pembayaran?.potongan ?? 0) > 0 && (
                  <div className="flex justify-between text-emerald-400 font-mono">
                    <span>
                      Diskon Promo {ticket.pembayaran?.kode_promo ? `(${ticket.pembayaran.kode_promo})` : ''}:
                    </span>
                    <span>-{formatIDR(ticket.pembayaran?.potongan ?? 0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white pt-1.5 border-t border-zinc-800 text-sm font-mono">
                  <span>Total Bayar:</span>
                  <span className="text-[#dfcbb5]">
                    {formatIDR(ticket.pembayaran?.total_bayar ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Validation Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pindai QR Saat Check-In di Lokasi</span>
              </div>
              <p className="text-[11px] text-zinc-400 max-w-sm leading-relaxed">
                Tunjukkan kode QR ini kepada resepsionis pengelola space untuk melakukan check-in dan aktivasi akses kunci digital.
              </p>
              <div className="text-[10px] text-zinc-400 font-mono pt-1">
                No. Tiket: {ticket.nomor_tiket}
              </div>
            </div>

            {/* QR Code Image — canvas-free via QR image API */}
            <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
              {qrPayload ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(qrPayload)}&bgcolor=ffffff&color=000000&margin=1`}
                  alt="QR Code Tiket"
                  className="w-32 h-32 object-contain"
                  width={128}
                  height={128}
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center text-xs text-zinc-900">
                  Membuat QR...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 text-center text-[11px] text-zinc-400 font-mono">
          Smart Space Booking • Dicetak secara digital • Berlaku sesuai jam reservasi tertera.
        </div>
      </div>
    </div>
  );
}
