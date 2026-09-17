'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarCheck2,
  LogIn,
  LogOut,
  Edit2,
  RefreshCw,
  Filter,
  Building2,
  Calendar,
  Search,
  RotateCcw,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  getAdminReservations,
  updateReservationStatus,
  checkInReservation,
  checkOutReservation,
  getAdminSpaces,
} from '@/lib/api/admin';
import { Reservation, ReservationStatus, Space } from '@/types/api';
import { formatIDR, getSpaceTypeLabel } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSkeleton, EmptyState } from '@/components/ui/EmptyState';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'belum_dikonfirm', label: 'Menunggu Konfirmasi' },
  { value: 'disetujui', label: 'Disetujui' },
  { value: 'aktif', label: 'Sesi Aktif' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [spaceFilter, setSpaceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Status Update Target
  const [statusModalTarget, setStatusModalTarget] = useState<Reservation | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<ReservationStatus>('disetujui');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resReservations, resSpaces] = await Promise.all([
        getAdminReservations({
          status: statusFilter,
          id_space: spaceFilter,
          tanggal: dateFilter || undefined,
        }),
        getAdminSpaces(),
      ]);

      if (resReservations.status && resReservations.data) {
        setReservations(resReservations.data);
      }
      if (resSpaces.status && resSpaces.data) {
        setSpaces(resSpaces.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, spaceFilter, dateFilter]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Robust Client-Side Filtering to guarantee 100% accurate results
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      // 2. Space Filter
      if (spaceFilter !== 'all') {
        const sid = r.id_space ?? r.space?.id_space ?? r.space?.id;
        if (String(sid) !== String(spaceFilter)) {
          return false;
        }
      }

      // 3. Date Filter (Normalized YYYY-MM-DD)
      if (dateFilter) {
        const resDate = r.tanggal_reservasi?.split('T')[0] || r.tanggal_reservasi;
        if (resDate !== dateFilter) {
          return false;
        }
      }

      // 4. Search Filter (kode booking, member name, space name, id)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idNum = String(r.id_reservasi ?? r.id ?? '');
        const code = `ssb-${idNum.padStart(6, '0')}`;
        const rawCode = (r.kode_booking || '').toLowerCase();
        const memberName = (r.nama_member || r.member?.nama_member || '').toLowerCase();
        const spaceName = (r.nama_space || r.space?.nama_space || '').toLowerCase();

        if (
          !idNum.includes(q) &&
          !code.includes(q) &&
          !rawCode.includes(q) &&
          !memberName.includes(q) &&
          !spaceName.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [reservations, statusFilter, spaceFilter, dateFilter, searchQuery]);

  const isFiltered =
    statusFilter !== 'all' ||
    spaceFilter !== 'all' ||
    Boolean(dateFilter) ||
    Boolean(searchQuery.trim());

  const activeFiltersCount = [
    statusFilter !== 'all',
    spaceFilter !== 'all',
    Boolean(dateFilter),
    Boolean(searchQuery.trim()),
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSpaceFilter('all');
    setDateFilter('');
    setSearchQuery('');
  };

  // Quick Action: Check-in
  const handleCheckIn = async (id: number) => {
    try {
      const res = await checkInReservation(id);
      if (res.status) {
        showToast(`Pengunjung #${id} berhasil Check-In.`);
        await loadReservations();
      }
    } catch {
      showToast('Gagal memproses check-in.');
    }
  };

  // Quick Action: Check-out
  const handleCheckOut = async (id: number) => {
    try {
      const res = await checkOutReservation(id);
      if (res.status) {
        showToast(`Pengunjung #${id} berhasil Check-Out.`);
        await loadReservations();
      }
    } catch {
      showToast('Gagal memproses check-out.');
    }
  };

  // Status Modal Submit
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalTarget) return;

    setIsUpdatingStatus(true);
    try {
      const resId = statusModalTarget.id_reservasi ?? statusModalTarget.id ?? 0;
      const res = await updateReservationStatus(resId, selectedNewStatus);
      if (res.status) {
        showToast(`Status reservasi #${resId} berhasil diubah.`);
        setStatusModalTarget(null);
        await loadReservations();
      } else {
        alert(res.message || 'Gagal mengubah status');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Kelola Reservasi Pengunjung
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Periksa jadwal, ubah status persetujuan, dan lakukan check-in/check-out barcode.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadReservations}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Muat Ulang
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 animate-in fade-in flex items-center justify-between">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Refined & Functional Filter Bar */}
      <div className="card-luxury p-4 sm:p-5 rounded-2xl space-y-4 border border-zinc-800/90 shadow-lg">
        {/* Top Header of Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880]">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-tight">
                Filter & Pencarian Reservasi
              </span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#c5a880]/20 text-[#dfcbb5] text-[10px] font-mono font-medium">
                  {activeFiltersCount} filter aktif
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Inputs Grid: Status, Space, Date, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase text-zinc-400">
              Status Reservasi
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/20 transition-colors cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Space Unit Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase text-zinc-400">
              Unit Ruang
            </label>
            <div className="relative">
              <select
                value={spaceFilter}
                onChange={(e) => setSpaceFilter(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/20 transition-colors cursor-pointer"
              >
                <option value="all" className="bg-zinc-900 text-zinc-100">
                  Semua Ruang Kerja
                </option>
                {spaces.map((s) => {
                  const sId = s.id_space ?? s.id ?? 1;
                  return (
                    <option key={sId} value={sId} className="bg-zinc-900 text-zinc-100">
                      {s.nama_space}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase text-zinc-400">
              Filter Tanggal
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/20 transition-colors cursor-pointer scheme-dark"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="absolute right-2.5 p-1 text-zinc-400 hover:text-white rounded transition-colors"
                  title="Hapus filter tanggal"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Search */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase text-zinc-400">
              Pencarian Cepat
            </label>
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Kode booking, nama member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/20 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 text-zinc-400 hover:text-white rounded transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom meta row: Results Counter & Active Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/40 text-[11px] font-mono text-zinc-400">
          <div>
            Menampilkan <span className="font-semibold text-white">{filteredReservations.length}</span> dari{' '}
            <span className="text-zinc-300">{reservations.length}</span> total reservasi
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px]">
                  <span>Status: {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}</span>
                  <button onClick={() => setStatusFilter('all')} className="hover:text-white cursor-pointer">
                    ✕
                  </button>
                </span>
              )}
              {spaceFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px]">
                  <span>
                    Ruang:{' '}
                    {spaces.find((s) => String(s.id_space ?? s.id) === String(spaceFilter))?.nama_space || spaceFilter}
                  </span>
                  <button onClick={() => setSpaceFilter('all')} className="hover:text-white cursor-pointer">
                    ✕
                  </button>
                </span>
              )}
              {dateFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px]">
                  <span>Tgl: {dateFilter}</span>
                  <button onClick={() => setDateFilter('')} className="hover:text-white cursor-pointer">
                    ✕
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px]">
                  <span>Cari: &quot;{searchQuery}&quot;</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer">
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reservation Data Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="Tidak Ada Reservasi Ditemukan"
          description={
            isFiltered
              ? 'Tidak ada pemesanan yang cocok dengan kriteria filter aktif saat ini.'
              : 'Belum ada data reservasi yang tercatat di sistem.'
          }
          actionLabel={isFiltered ? 'Reset Semua Filter' : undefined}
          onAction={isFiltered ? handleResetFilters : undefined}
        />
      ) : (
        <div className="card-luxury rounded-2xl overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase">
                <tr>
                  <th className="px-4 py-3.5">ID Booking</th>
                  <th className="px-4 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Ruang Kerja</th>
                  <th className="px-4 py-3.5">Jadwal Sesi</th>
                  <th className="px-4 py-3.5">Biaya</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredReservations.map((res) => {
                  const resId = res.id_reservasi ?? res.id ?? 0;
                  return (
                    <tr key={resId} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-zinc-200">
                        #{resId}
                      </td>
                      <td className="px-4 py-3.5 font-sans">
                        <div className="font-semibold text-white">
                          {res.nama_member || res.member?.nama_member || 'Pengunjung'}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          ID Member: {res.id_member || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-sans">
                        <div className="text-zinc-200">{res.nama_space || res.space?.nama_space}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {getSpaceTypeLabel(res.tipe_space || res.space?.tipe || 'desk')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-zinc-200">{res.tanggal_reservasi?.split('T')[0] || res.tanggal_reservasi}</div>
                        <div className="text-[10px] text-zinc-400">
                          {res.jam_mulai} ({res.durasi_jam} Jam)
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-white">
                        {formatIDR(res.total_harga || res.total_bayar || 0)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={res.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Check-in button (if disetujui) */}
                          {res.status === 'disetujui' && (
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => handleCheckIn(resId)}
                              leftIcon={<LogIn className="w-3.5 h-3.5" />}
                            >
                              Check-In
                            </Button>
                          )}

                          {/* Check-out button (if aktif) */}
                          {res.status === 'aktif' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCheckOut(resId)}
                              leftIcon={<LogOut className="w-3.5 h-3.5" />}
                            >
                              Check-Out
                            </Button>
                          )}

                          {/* Change status button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStatusModalTarget(res);
                              setSelectedNewStatus(res.status);
                            }}
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          >
                            Ubah Status
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Update Status */}
      <Modal
        isOpen={!!statusModalTarget}
        onClose={() => setStatusModalTarget(null)}
        title="Perbarui Status Reservasi"
        description={`Ubah status pemesanan untuk reservasi #${statusModalTarget?.id_reservasi ?? statusModalTarget?.id}`}
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 pt-2">
          {statusModalTarget && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <div className="text-white font-semibold">{statusModalTarget.nama_member}</div>
              <div className="text-zinc-400 font-mono">
                {statusModalTarget.nama_space} • {statusModalTarget.tanggal_reservasi?.split('T')[0] || statusModalTarget.tanggal_reservasi}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Pilih Status Baru
            </label>
            <div className="relative">
              <select
                value={selectedNewStatus}
                onChange={(e) => setSelectedNewStatus(e.target.value as ReservationStatus)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
              >
                <option value="belum_dikonfirm">belum_dikonfirm (Menunggu Konfirmasi)</option>
                <option value="disetujui">disetujui (Disetujui)</option>
                <option value="aktif">aktif (Sesi Aktif / Check-In)</option>
                <option value="selesai">selesai (Selesai / Check-Out)</option>
                <option value="dibatalkan">dibatalkan (Dibatalkan)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusModalTarget(null)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingStatus}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
