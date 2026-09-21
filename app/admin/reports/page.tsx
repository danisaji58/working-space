'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Printer,
  FileSpreadsheet,
  Sparkles,
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  BarChart3,
  Layers,
  Calendar,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  getMonthlyReport,
  getIncomeReport,
  getAdminReservations,
  getAdminSpaces,
} from '@/lib/api/admin';
import { MonthlyReport, IncomeReport, Reservation, Space } from '@/types/api';
import { formatIDR, getSpaceTypeLabel } from '@/lib/utils';
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
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [income, setIncomeReport] = useState<IncomeReport | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'trend' | 'category'>('trend');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const [resM, resI, resR, resS] = await Promise.all([
          getMonthlyReport({ month: selectedMonth, year: selectedYear }),
          getIncomeReport({ month: selectedMonth, year: selectedYear }),
          getAdminReservations({ month: selectedMonth, year: selectedYear }),
          getAdminSpaces(),
        ]);
        if (resM.status && resM.data) setMonthly(resM.data);
        if (resI.status && resI.data) setIncomeReport(resI.data);
        if (resR.status && resR.data) setReservations(resR.data);
        if (resS.status && resS.data) setSpaces(resS.data);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, [selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  // Valid reservations for calculations
  const validReservations = useMemo(() => {
    return reservations.filter((r) => r.status !== 'dibatalkan');
  }, [reservations]);

  // Real financial summary numbers
  const realisasiBersih = useMemo(() => {
    return validReservations.reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);
  }, [validReservations]);

  const totalJam = useMemo(() => {
    return validReservations.reduce((acc, curr) => acc + (Number(curr.durasi_jam) || 0), 0);
  }, [validReservations]);

  const totalTransaksi = validReservations.length;

  const estimasiKotor = useMemo(() => {
    return validReservations.reduce((acc, curr) => {
      const sp = spaces.find((s) => s.id_space === curr.id_space);
      const hourly = sp?.harga_per_jam || curr.harga_per_jam || 0;
      return acc + hourly * (Number(curr.durasi_jam) || 1);
    }, 0);
  }, [validReservations, spaces]);

  const totalPotongan = Math.max(0, estimasiKotor - realisasiBersih);

  // 12-Month Real Trend Data
  const monthlyTrend = useMemo(() => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    return monthNames.map((name, index) => {
      const monthNum = index + 1;
      const filtered = validReservations.filter((r) => {
        const d = new Date(r.tanggal_reservasi);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        return String(y) === String(selectedYear) && m === monthNum;
      });

      const rev = filtered.reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);
      const hrs = filtered.reduce((acc, curr) => acc + (Number(curr.durasi_jam) || 0), 0);

      return {
        monthIndex: index,
        monthName: name,
        revenue: rev,
        bookings: filtered.length,
        hours: hrs,
      };
    });
  }, [validReservations, selectedYear]);

  const maxMonthRevenue = useMemo(() => {
    const maxVal = Math.max(...monthlyTrend.map((m) => m.revenue));
    return maxVal > 0 ? maxVal : 500000;
  }, [monthlyTrend]);

  // Real Category Breakdown
  const categoryPerformance = useMemo(() => {
    const types = [
      {
        key: 'desk',
        label: 'Personal Desk',
        color: '#c5a880',
        bg: 'bg-[#c5a880]',
        badge: 'border-[#c5a880]/30 text-[#c5a880] bg-[#c5a880]/10',
      },
      {
        key: 'meeting_room',
        label: 'Meeting Room',
        color: '#10b981',
        bg: 'bg-emerald-500',
        badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      },
      {
        key: 'private_office',
        label: 'Private Office',
        color: '#38bdf8',
        bg: 'bg-sky-500',
        badge: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
      },
    ];

    return types.map((t) => {
      const items = validReservations.filter((r) => {
        const sp = spaces.find((s) => s.id_space === r.id_space);
        return (sp?.tipe === t.key || r.tipe_space === t.key);
      });

      const rev = items.reduce((acc, curr) => acc + (Number(curr.total_harga) || 0), 0);
      const hrs = items.reduce((acc, curr) => acc + (Number(curr.durasi_jam) || 0), 0);
      const percentage = realisasiBersih > 0 ? Math.round((rev / realisasiBersih) * 100) : 0;

      return {
        ...t,
        totalBookings: items.length,
        totalRevenue: rev,
        totalHours: hrs,
        percentage,
      };
    });
  }, [validReservations, spaces, realisasiBersih]);

  // Export Full Recap to Excel (CSV compatible with Microsoft Excel, Google Sheets, etc.)
  const handleExportExcel = () => {
    const monthLabel =
      MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || 'Semua Bulan';
    const filename = `Laporan_Finansial_Coworking_${selectedMonth !== 'all' ? selectedMonth + '_' : ''}${selectedYear}.csv`;

    const rows: (string | number)[][] = [
      ['REKAPITULASI LAPORAN FINANSIAL & RESERVASI COWORKING SPACE'],
      ['Periode Bulan', monthLabel],
      ['Periode Tahun', selectedYear],
      ['Tanggal Unduh', new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })],
      [],
      ['--- RINGKASAN FINANSIAL ---'],
      ['Indikator', 'Nilai'],
      ['Realisasi Pendapatan Bersih', realisasiBersih],
      ['Estimasi Pendapatan Kotor', estimasiKotor],
      ['Total Potongan Diskon', totalPotongan],
      ['Total Transaksi Selesai/Aktif', totalTransaksi],
      ['Total Jam Penggunaan Ruang', totalJam],
      [],
      ['--- DISTRIBUSI PENDAPATAN PER JENIS RUANG ---'],
      ['Jenis Ruang', 'Jumlah Booking', 'Total Jam', 'Total Pendapatan (Rp)', 'Kontribusi (%)'],
      ...categoryPerformance.map((c) => [
        c.label,
        c.totalBookings,
        c.totalHours,
        c.totalRevenue,
        `${c.percentage}%`,
      ]),
      [],
      ['--- RINCIAN DETAIL TRANSAKSI RESERVASI ---'],
      [
        'No',
        'ID Reservasi',
        'Tanggal Reservasi',
        'Jam Mulai',
        'Durasi (Jam)',
        'Nama Member',
        'Ruang Kerja',
        'Tipe Ruang',
        'Tarif/Jam (Rp)',
        'Kode Promo',
        'Total Bayar (Rp)',
        'Status',
      ],
      ...reservations.map((r, idx) => {
        const sid = r.id_space ?? r.space?.id_space ?? r.space?.id;
        const sp = spaces.find((s) => s.id_space === sid);
        const hourlyRate = sp?.harga_per_jam || r.harga_per_jam || 0;
        return [
          idx + 1,
          r.id_reservasi ?? r.id ?? '-',
          r.tanggal_reservasi,
          r.jam_mulai || '-',
          r.durasi_jam || 1,
          r.nama_member || 'Pengunjung',
          r.nama_space || sp?.nama_space || 'Ruang Kerja',
          getSpaceTypeLabel(r.tipe_space || sp?.tipe || 'desk'),
          hourlyRate,
          r.kode_promo || '-',
          r.total_harga || r.total_bayar || 0,
          r.status,
        ];
      }),
    ];

    const csvContent =
      '\uFEFF' +
      rows
        .map((row) =>
          row
            .map((field) => {
              const str = String(field ?? '');
              return str.includes(',') || str.includes(';') || str.includes('\n')
                ? `"${str.replace(/"/g, '""')}"`
                : str;
            })
            .join(';')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Laporan Finansial & Reservasi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Visualisasi grafik omzet riil, utilisasi ruang, dan riwayat transaksi coworking space.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month & Year Filter */}
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
            onClick={handleExportExcel}
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
            className="shadow-sm hover:shadow-md transition-all font-semibold"
          >
            Rekap Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          {/* Summary KPI Cards */}
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
                Pendapatan riil setelah diskon
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
              <p className="text-[11px] text-zinc-400">Reservasi valid terdata</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-400 font-mono uppercase flex items-center justify-between">
                <span>Total Jam Terpakai</span>
                <Clock className="w-4 h-4 text-[#c5a880]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#c5a880]">
                {totalJam} Jam
              </div>
              <p className="text-[11px] text-zinc-400">Durasi pemakaian ruang</p>
            </div>
          </div>

          {/* Real Interactive Chart Section */}
          <div className="card-luxury p-6 rounded-3xl border border-zinc-800 space-y-6">
            {/* Chart Header with Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#c5a880]" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Grafik Realisasi Pendapatan & Performa Space
                  </h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Data grafik dihitung secara riil berdasarkan reservasi tahun {selectedYear}.
                </p>
              </div>

              {/* View Tab Buttons */}
              <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('trend')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'trend'
                      ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Tren Bulanan (12 Bln)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('category')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'category'
                      ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Per Jenis Space</span>
                </button>
              </div>
            </div>

            {/* TAB 1: 12-Month Real Revenue Bar & Area Chart */}
            {activeTab === 'trend' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Visual SVG & Interactive Bar Graph */}
                <div className="relative pt-6 pb-2 px-2">
                  {/* Y-Axis Guideline Indicators */}
                  <div className="absolute inset-x-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-zinc-600 border-dashed w-full" />
                    <div className="border-b border-zinc-600 border-dashed w-full" />
                    <div className="border-b border-zinc-600 border-dashed w-full" />
                  </div>

                  {/* 12 Bars Container */}
                  <div className="relative h-64 flex items-end justify-between gap-2 sm:gap-4 z-10">
                    {monthlyTrend.map((m, idx) => {
                      const heightPercent =
                        maxMonthRevenue > 0
                          ? Math.min(100, Math.max(6, (m.revenue / maxMonthRevenue) * 100))
                          : 6;
                      const isHovered = hoveredBar === idx;
                      const hasData = m.revenue > 0;

                      return (
                        <div
                          key={m.monthName}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {/* Floating Tooltip */}
                          {isHovered && (
                            <div className="absolute -top-16 z-30 bg-zinc-950 border border-zinc-700 shadow-2xl p-2.5 rounded-xl text-center min-w-[120px] pointer-events-none animate-in fade-in zoom-in-95">
                              <div className="text-[10px] font-mono text-zinc-400 uppercase">
                                {m.monthName} {selectedYear}
                              </div>
                              <div className="text-xs font-bold font-mono text-emerald-400">
                                {formatIDR(m.revenue)}
                              </div>
                              <div className="text-[9px] text-zinc-300 font-mono">
                                {m.bookings} Booking • {m.hours} Jam
                              </div>
                            </div>
                          )}

                          {/* Bar Column */}
                          <div className="w-full max-w-[42px] h-full flex items-end justify-center">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                                hasData
                                  ? isHovered
                                    ? 'bg-gradient-to-t from-[#c5a880] to-[#dfcbb5] shadow-lg shadow-[#c5a880]/20 scale-105'
                                    : 'bg-gradient-to-t from-[#c5a880]/70 to-[#c5a880]'
                                  : 'bg-zinc-800/40 hover:bg-zinc-800/80 border-t border-zinc-700/50'
                              }`}
                            >
                              {/* Inner Glass Highlight */}
                              <div className="absolute inset-0 bg-white/10 opacity-40 pointer-events-none" />
                            </div>
                          </div>

                          {/* Month Label */}
                          <span
                            className={`text-[11px] font-mono mt-3 transition-colors ${
                              isHovered || hasData ? 'text-white font-bold' : 'text-zinc-500'
                            }`}
                          >
                            {m.monthName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend & Peak Summary Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-[#c5a880]" />
                      <span>Realisasi Omzet (Rp)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-zinc-800" />
                      <span>Periode Belum Ada Transaksi</span>
                    </div>
                  </div>

                  <div className="text-zinc-300 font-mono text-[11px]">
                    Total Akumulasi {selectedYear}:{' '}
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatIDR(realisasiBersih)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Space Type Category Real Performance Breakdown */}
            {activeTab === 'category' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Performance Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categoryPerformance.map((cat) => (
                    <div
                      key={cat.key}
                      className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 space-y-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{cat.label}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${cat.badge}`}
                        >
                          {cat.percentage}%
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-2xl font-bold font-mono text-white">
                          {formatIDR(cat.totalRevenue)}
                        </div>
                        <p className="text-[11px] text-zinc-400">Total pendapatan unit</p>
                      </div>

                      <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase">Booking</div>
                          <div className="font-semibold text-zinc-200">{cat.totalBookings} Sesi</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 uppercase">Durasi</div>
                          <div className="font-semibold text-zinc-200">{cat.totalHours} Jam</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real Transactions Ledger Table */}
          <div className="card-luxury p-6 rounded-3xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#c5a880]" />
                <h3 className="text-base font-semibold text-white">
                  Daftar Transaksi Periode Terpilih ({selectedMonth !== 'all' ? `Bulan ${selectedMonth}` : 'Semua Bulan'} / {selectedYear})
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {validReservations.length} Transaksi Ditemukan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">ID & Member</th>
                    <th className="py-3 px-4">Ruang Kerja</th>
                    <th className="py-3 px-4">Tipe Space</th>
                    <th className="py-3 px-4">Jadwal & Durasi</th>
                    <th className="py-3 px-4 text-right">Total Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {validReservations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500 font-sans">
                        Belum ada transaksi pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    validReservations.map((res) => (
                      <tr key={res.id_reservasi} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white font-sans">
                            {res.nama_member || 'Pengunjung'}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            #{res.id_reservasi}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-zinc-200">
                          {res.nama_space}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          {getSpaceTypeLabel(res.tipe_space || 'desk')}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          <div>{res.tanggal_reservasi}</div>
                          <div className="text-[10px] text-zinc-500">{res.jam_mulai} ({res.durasi_jam} jam)</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-right">
                          {formatIDR(res.total_harga)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
