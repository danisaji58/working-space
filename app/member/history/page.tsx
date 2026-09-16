'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Filter, Ticket, Sparkles, ReceiptText, Wallet } from 'lucide-react';
import { getMyHistory } from '@/lib/api/reservations';
import { Reservation, ReservationHistorySummary } from '@/types/api';
import { formatIDR, formatDate, calculateEndTime, getSpaceTypeLabel } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingSkeleton } from '@/components/ui/EmptyState';

const MONTH_OPTIONS = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const YEAR_OPTIONS = [
  { value: 'all', label: 'Semua Tahun' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2027', label: '2027' },
];

export default function ReservationHistoryPage() {
  const [summary, setSummary] = useState<ReservationHistorySummary | null>(null);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      try {
        const res = await getMyHistory(selectedMonth, selectedYear);
        if (res.status && res.data) {
          setSummary(res.data);
          setHistory(res.data.items || []);
        } else {
          setSummary(null);
          setHistory([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rekapitulasi Aktivitas</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Riwayat Reservasi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Arsip seluruh sesi reservasi coworking space yang telah selesai, aktif, maupun dibatalkan.
          </p>
        </div>

        {/* Month & Year filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-3 py-2 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value} className="bg-zinc-900 text-white">
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-3 py-2 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y.value} value={y.value} className="bg-zinc-900 text-white">
                {y.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats (Official Endpoint 21 Response) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Total Reservasi Periode
            </span>
            <div className="text-2xl font-bold font-mono text-white">
              {summary ? summary.total_reservasi : history.length} Sesi
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
            <ReceiptText className="w-5 h-5 text-[#c5a880]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Total Pengeluaran Sesi
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {formatIDR(
                summary
                  ? summary.total_pengeluaran
                  : history.reduce((acc, h) => acc + (h.total_bayar || h.total_harga || 0), 0)
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* History table */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : history.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Tidak Ada Riwayat Reservasi"
          description="Belum ada data reservasi pada bulan dan tahun yang dipilih."
          actionLabel="Tampilkan Semua Periode"
          onAction={() => {
            setSelectedMonth('all');
            setSelectedYear('all');
          }}
        />
      ) : (
        <div className="card-luxury rounded-2xl overflow-hidden border border-zinc-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Kode Booking</th>
                  <th className="py-3 px-4">Ruang Kerja</th>
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Durasi</th>
                  <th className="py-3 px-4">Total Biaya</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {history.map((item) => {
                  const targetId = item.id_reservasi ?? item.id;
                  const end = calculateEndTime(item.jam_mulai, item.durasi_jam);
                  return (
                    <tr key={targetId} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        {item.kode_booking || `BOOK-${targetId}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-200">
                          {item.nama_space || item.space_name || item.space?.nama_space || 'Workstation'}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {getSpaceTypeLabel(item.tipe_space || item.space?.tipe || 'desk')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{formatDate(item.tanggal_reservasi)}</div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          {item.jam_mulai} - {end} WIB
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{item.durasi_jam} Jam</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">
                        {formatIDR(item.total_bayar || item.total_harga || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/member/reservations/${targetId}/ticket`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Ticket className="w-3.5 h-3.5 text-[#c5a880]" />}
                          >
                            E-Ticket
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
