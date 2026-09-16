'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck2,
  LogIn,
  LogOut,
  Edit2,
  Sparkles,
  RefreshCw,
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

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [spaceFilter, setSpaceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('all');

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
          month: monthFilter,
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
  }, [statusFilter, spaceFilter, dateFilter, monthFilter]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
      const res = await updateReservationStatus(
        resId,
        selectedNewStatus
      );
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
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Status Reservasi
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Space Unit Filter */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Unit Ruang
          </label>
          <select
            value={spaceFilter}
            onChange={(e) => setSpaceFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-500"
          >
            <option value="all" className="bg-zinc-900">
              Semua Ruang Kerja
            </option>
            {spaces.map((s) => (
              <option key={s.id_space} value={s.id_space} className="bg-zinc-900">
                {s.nama_space}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
            Filter Tanggal
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Reset Filter Button */}
        <div className="flex items-end">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              setStatusFilter('all');
              setSpaceFilter('all');
              setDateFilter('');
              setMonthFilter('all');
            }}
          >
            Reset Semua Filter
          </Button>
        </div>
      </div>

      {/* Reservation Data Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="Tidak Ada Reservasi Ditemukan"
          description="Tidak ada data pemesanan yang sesuai dengan filter yang aktif saat ini."
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
                {reservations.map((res) => (
                  <tr key={res.id_reservasi} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-zinc-200">
                      #{res.id_reservasi}
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <div className="font-semibold text-white">
                        {res.nama_member || 'Pengunjung'}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        ID Member: {res.id_member || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <div className="text-zinc-200">{res.nama_space}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {getSpaceTypeLabel(res.tipe_space || 'desk')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-zinc-200">{res.tanggal_reservasi}</div>
                      <div className="text-[10px] text-zinc-400">
                        {res.jam_mulai} ({res.durasi_jam} Jam)
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-white">
                      {formatIDR(res.total_harga)}
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
                            onClick={() => handleCheckIn(res.id_reservasi ?? res.id ?? 0)}
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
                            onClick={() => handleCheckOut(res.id_reservasi ?? res.id ?? 0)}
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
                ))}
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
        description={`Ubah status pemesanan untuk reservasi #${statusModalTarget?.id_reservasi}`}
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 pt-2">
          {statusModalTarget && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <div className="text-white font-semibold">{statusModalTarget.nama_member}</div>
              <div className="text-zinc-400 font-mono">
                {statusModalTarget.nama_space} • {statusModalTarget.tanggal_reservasi}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Pilih Status Baru
            </label>
            <select
              value={selectedNewStatus}
              onChange={(e) => setSelectedNewStatus(e.target.value as ReservationStatus)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
            >
              <option value="belum_dikonfirm">belum_dikonfirm (Menunggu Konfirmasi)</option>
              <option value="disetujui">disetujui (Disetujui)</option>
              <option value="aktif">aktif (Sesi Aktif / Check-In)</option>
              <option value="selesai">selesai (Selesai / Check-Out)</option>
              <option value="dibatalkan">dibatalkan (Dibatalkan)</option>
            </select>
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
