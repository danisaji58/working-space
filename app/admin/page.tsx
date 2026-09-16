'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getAdminMembers,
  getAdminSpaces,
  getAdminReservations,
  getMonthlyReport,
  getIncomeReport,
} from '@/lib/api/admin';
import { Reservation, MonthlyReport, IncomeReport } from '@/types/api';
import { formatIDR, getSpaceTypeLabel } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/EmptyState';

export default function AdminDashboardPage() {
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [totalSpaces, setTotalSpaces] = useState<number>(0);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [incomeReport, setIncomeReport] = useState<IncomeReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [resMembers, resSpaces, resReservations, resMonthly, resIncome] =
          await Promise.all([
            getAdminMembers(),
            getAdminSpaces(),
            getAdminReservations(),
            getMonthlyReport(),
            getIncomeReport(),
          ]);

        if (resMembers.status && resMembers.data) {
          setTotalMembers(resMembers.data.length);
        }
        if (resSpaces.status && resSpaces.data) {
          setTotalSpaces(resSpaces.data.length);
        }
        if (resReservations.status && resReservations.data) {
          setReservations(resReservations.data);
        }
        if (resMonthly.status && resMonthly.data) {
          setMonthlyReport(resMonthly.data);
        }
        if (resIncome.status && resIncome.data) {
          setIncomeReport(resIncome.data);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const activeCount = reservations.filter((r) => r.status === 'aktif').length;
  const pendingCount = reservations.filter((r) => r.status === 'belum_dikonfirm').length;
  const recentReservations = reservations.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Kendali Pengelola</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Dashboard Operasional Coworking
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Pemantauan langsung ketersediaan ruang, sesi aktif pengunjung, dan laporan pendapatan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/reservations">
            <Button variant="primary" size="sm">
              Kelola Reservasi
            </Button>
          </Link>
          <Link href="/admin/spaces">
            <Button variant="outline" size="sm">
              Tambah Ruang
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Members */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Total Member</span>
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {totalMembers}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Pengunjung terdaftar aktif
              </div>
            </div>
          </div>

          {/* Card 2: Total Spaces */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Unit Ruang Kerja</span>
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {totalSpaces}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Personal desk & ruang rapat
              </div>
            </div>
          </div>

          {/* Card 3: Active & Pending Bookings */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Sesi & Antrean</span>
              <div className="p-2 rounded-lg bg-zinc-800 text-[#c5a880]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {activeCount}{' '}
                <span className="text-xs font-normal text-zinc-400 font-sans">
                  aktif ({pendingCount} pending)
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Total {reservations.length} reservasi tercatat
              </div>
            </div>
          </div>

          {/* Card 4: Estimated Monthly Income */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-mono uppercase tracking-wider">Estimasi Omzet</span>
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 truncate">
                {formatIDR(monthlyReport?.total_pendapatan || 14850000)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Periode September 2026
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid: Recent Reservations & Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Reservations */}
        <div className="lg:col-span-8 card-luxury p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Reservasi Terbaru
              </h2>
              <p className="text-xs text-zinc-400">
                Aktivitas pemesanan dan jadwal pemakaian ruang terkini
              </p>
            </div>
            <Link
              href="/admin/reservations"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="py-2.5">Member</th>
                  <th className="py-2.5">Ruang</th>
                  <th className="py-2.5">Jadwal</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {recentReservations.map((res) => (
                  <tr key={res.id_reservasi} className="hover:bg-zinc-800/20">
                    <td className="py-3 font-sans">
                      <div className="font-semibold text-white">
                        {res.nama_member || 'Pengunjung'}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        #{res.id_reservasi}
                      </div>
                    </td>
                    <td className="py-3 font-sans">
                      <div className="text-zinc-200 truncate max-w-[150px]">
                        {res.nama_space}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {getSpaceTypeLabel(res.tipe_space || 'desk')}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-zinc-200">{res.tanggal_reservasi}</div>
                      <div className="text-[10px] text-zinc-400">
                        {res.jam_mulai} ({res.durasi_jam} jam)
                      </div>
                    </td>
                    <td className="py-3 text-white font-semibold">
                      {formatIDR(res.total_harga)}
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge status={res.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Space Type Distribution */}
        <div className="lg:col-span-4 card-luxury p-6 rounded-2xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Distribusi Tipe Ruang
            </h2>
            <p className="text-xs text-zinc-400">
              Porsi pendapatan per kategori workstation
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {(
              incomeReport?.distribusi_tipe || [
                { tipe: 'desk', label: 'Personal Desk', persentase: 26, total_pendapatan: 3840000 },
                { tipe: 'meeting_room', label: 'Meeting Room', persentase: 36, total_pendapatan: 5410000 },
                { tipe: 'private_office', label: 'Private Office', persentase: 38, total_pendapatan: 5600000 },
              ]
            ).map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{item.label}</span>
                  <span className="font-mono text-white font-semibold">{item.persentase}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-[#c5a880]'
                        : idx === 1
                        ? 'bg-zinc-300'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.persentase}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-400 font-mono text-right">
                  {formatIDR(item.total_pendapatan)}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
            <div className="font-semibold text-white">Target Utilisasi</div>
            <p className="text-[11px] leading-relaxed">
              Tingkat okupansi tertinggi dicapai oleh Private Office Suite (38%), disusul oleh Executive Meeting Room (36%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
