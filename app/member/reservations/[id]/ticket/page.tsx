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
  QrCode,
  Sparkles,
  Download,
  Copy,
  Check
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      if (!reservationId) return;
      setIsLoading(true);
      try {
        const res = await getETicket(reservationId);
        if (res.status && res.data) {
          setTicket(res.data);
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

  const handleCopyBooking = () => {
    if (!ticket?.kode_booking) return;
    navigator.clipboard.writeText(ticket.kode_booking);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

  // Guaranteed QR Payload with full fallback
  const qrDataString =
    ticket.qr_payload ||
    JSON.stringify({
      nomor_tiket: ticket.nomor_tiket || `TKT-${String(reservationId).padStart(6, '0')}`,
      kode_booking: ticket.kode_booking || `SSB-${String(reservationId).padStart(6, '0')}`,
      id_reservasi: reservationId,
      member: ticket.member?.nama || 'Member',
      space: ticket.space?.nama || 'Workstation',
      tanggal: ticket.jadwal?.tanggal,
      jam: `${ticket.jadwal?.jam_mulai} - ${ticket.jadwal?.jam_selesai}`,
      status: ticket.pembayaran?.status_reservasi ?? ticket.status ?? 'aktif',
    });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    qrDataString
  )}&bgcolor=ffffff&color=000000&margin=2`;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
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
      <div className="ticket-container bg-zinc-900/95 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100">
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

          <div className="text-right space-y-1.5 shrink-0">
            <div className="text-[10px] uppercase font-mono text-zinc-400">Kode Booking</div>
            <button
              onClick={handleCopyBooking}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs sm:text-sm font-bold font-mono text-[#dfcbb5] tracking-wider hover:border-[#c5a880] transition-colors"
              title="Salin kode booking"
            >
              <span>{ticket.kode_booking || `SSB-${String(reservationId).padStart(6, '0')}`}</span>
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            </button>
            <div className="pt-0.5">
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
                  {ticket.space?.nama ?? 'Workstation Space'}
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
                  <span>{ticket.member?.instansi ?? 'Member Personal'}</span>
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

          {/* QR Code Validation Section - Prominent & Guaranteed */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>QR Access Pass Check-In</span>
              </div>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Tunjukkan QR Code resmi ini ke scanner pintu pintar atau staf resepsionis di venue untuk aktivasi kunci akses dan validasi kehadiran Anda.
              </p>
              <div className="text-[11px] text-zinc-400 font-mono pt-1">
                No. Tiket: <strong className="text-zinc-200">{ticket.nomor_tiket || `TKT-${String(reservationId).padStart(6, '0')}`}</strong>
              </div>
            </div>

            {/* High Resolution Official QR Code */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt={`QR Code Tiket #${ticket.nomor_tiket}`}
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                  width={160}
                  height={160}
                />
              </div>
              <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                <QrCode className="w-3 h-3 text-[#c5a880]" />
                Scan saat check-in lokasi
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 text-center text-[11px] text-zinc-400 font-mono">
          Smart Space Booking • Dicetak secara digital • Berlaku sesuai jam reservasi tertera.
        </div>
      </div>
    </div>
  );
}
