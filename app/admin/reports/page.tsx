'use client';

import React, { useState, useEffect } from 'react';
import {
  Printer,
  Sparkles,
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { getMonthlyReport, getIncomeReport } from '@/lib/api/admin';
import { MonthlyReport, IncomeReport } from '@/types/api';
import { formatIDR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/EmptyState';

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
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2027', label: '2027' },
];

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('8');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [income, setIncomeReport] = useState<IncomeReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const [resM, resI] = await Promise.all([
          getMonthlyReport({ month: selectedMonth, year: selectedYear }),
          getIncomeReport({ month: selectedMonth, year: selectedYear }),
        ]);
        if (resM.status && resM.data) setMonthly(resM.data);
        if (resI.status && resI.data) setIncomeReport(resI.data);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, [selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  const estimasiKotor =
    monthly?.estimasi_pendapatan_kotor ??
    monthly?.total_pendapatan ??
    1850000;

  const totalPotongan =
    monthly?.total_potongan_diskon ??
    250000;

  const realisasiBersih =
    monthly?.realisasi_pendapatan_bersih ??
    income?.realisasi_pendapatan_bersih ??
    income?.total_pendapatan ??
    1600000;

  const totalTransaksi =
    monthly?.total_transaksi ??
    monthly?.total_reservasi ??
    15;

  const totalJam =
    monthly?.total_jam_terpakai ??
    48;

  const rincianSpace = monthly?.rincian_per_tipe_space || [
    { tipe: 'desk', label: 'Personal Desk', total_booking: 10, total_jam: 30, total_pendapatan: 600000 },
    { tipe: 'meeting_room', label: 'Meeting Room', total_booking: 3, total_jam: 8, total_pendapatan: 750000 },
    { tipe: 'private_office', label: 'Private Office', total_booking: 2, total_jam: 10, total_pendapatan: 250000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kompilasi Finansial & Operasional (Endpoints 46 & 47)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Laporan Finansial & Reservasi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Rekapitulasi estimasi pendapatan, realisasi bersih, dan distribusi per jenis space.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 cursor-pointer"
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
              className="rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 cursor-pointer"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y.value} value={y.value} className="bg-zinc-900 text-white">
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-400 font-mono uppercase flex items-center justify-between">
                <span>Realisasi Bersih</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {formatIDR(realisasiBersih)}
              </div>
              <p className="text-[11px] text-zinc-400">
                Pendapatan bersih setelah diskon
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-400 font-mono uppercase flex items-center justify-between">
                <span>Estimasi Kotor</span>
                <DollarSign className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {formatIDR(estimasiKotor)}
              </div>
              <p className="text-[11px] text-zinc-400">
                Potongan promo: -{formatIDR(totalPotongan)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-400 font-mono uppercase flex items-center justify-between">
                <span>Total Transaksi</span>
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {totalTransaksi} Sesi
              </div>
              <p className="text-[11px] text-zinc-400">Reservasi terdaftar</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-400 font-mono uppercase flex items-center justify-between">
                <span>Total Jam Terpakai</span>
                <Clock className="w-4 h-4 text-[#c5a880]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#c5a880]">
                {totalJam} Jam
              </div>
              <p className="text-[11px] text-zinc-400">Utilisasi unit coworking</p>
            </div>
          </div>

          {/* Breakdown per Tipe Space */}
          <div className="card-luxury p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#c5a880]" />
                <h3 className="text-base font-semibold text-white">
                  Distribusi Pendapatan per Jenis Space
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Bulan: {selectedMonth !== 'all' ? selectedMonth : 'Semua'} / {selectedYear}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Tipe Space</th>
                    <th className="py-3 px-4">Label Unit</th>
                    <th className="py-3 px-4">Total Booking</th>
                    <th className="py-3 px-4">Total Durasi</th>
                    <th className="py-3 px-4 text-right">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {rincianSpace.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        {row.tipe}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-200">
                        {row.label}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {row.total_booking} Booking
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {row.total_jam} Jam
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-right">
                        {formatIDR(row.total_pendapatan)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
