'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import {
  getAdminDiscounts,
  getAdminDiscountById,
  createAdminDiscount,
  updateAdminDiscount,
  deleteAdminDiscount,
} from '@/lib/api/admin';
import { Discount } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton, EmptyState } from '@/components/ui/EmptyState';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    nama_diskon: '',
    persentase_diskon: 20,
    tanggal_awal: new Date().toISOString().split('T')[0],
    tanggal_akhir: '2026-12-31',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadDiscounts = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminDiscounts();
      if (res.status && res.data) {
        setDiscounts(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingDiscount(null);
    setFormData({
      nama_diskon: '',
      persentase_diskon: 20,
      tanggal_awal: new Date().toISOString().split('T')[0],
      tanggal_akhir: '2026-12-31',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Endpoint 39: GET /api/admin/diskon/{id}
  const openEditModal = async (d: Discount) => {
    setEditingDiscount(d);
    setFormData({
      nama_diskon: d.nama_diskon,
      persentase_diskon: d.persentase_diskon,
      tanggal_awal: d.tanggal_awal ? d.tanggal_awal.split('T')[0] : '',
      tanggal_akhir: d.tanggal_akhir ? d.tanggal_akhir.split('T')[0] : '',
    });
    setFormErrors({});
    setIsModalOpen(true);

    const targetId = d.id_diskon || d.id;
    if (targetId) {
      try {
        const res = await getAdminDiscountById(targetId);
        if (res.status && res.data) {
          const fresh = res.data;
          setFormData({
            nama_diskon: fresh.nama_diskon || d.nama_diskon,
            persentase_diskon: fresh.persentase_diskon ?? d.persentase_diskon,
            tanggal_awal: fresh.tanggal_awal ? fresh.tanggal_awal.split('T')[0] : d.tanggal_awal,
            tanggal_akhir: fresh.tanggal_akhir ? fresh.tanggal_akhir.split('T')[0] : d.tanggal_akhir,
          });
        }
      } catch {
        // use initial data
      }
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nama_diskon.trim()) errs.nama_diskon = 'Kode promo wajib diisi';
    if (
      !formData.persentase_diskon ||
      formData.persentase_diskon < 1 ||
      formData.persentase_diskon > 100
    ) {
      errs.persentase_diskon = 'Persentase diskon harus bernilai antara 1 s/d 100%';
    }
    if (!formData.tanggal_awal) errs.tanggal_awal = 'Tanggal awal wajib dipilih';
    if (!formData.tanggal_akhir) errs.tanggal_akhir = 'Tanggal akhir wajib dipilih';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (editingDiscount) {
        const discountId = editingDiscount.id_diskon ?? editingDiscount.id ?? 0;
        const res = await updateAdminDiscount(discountId, formData);
        if (res.status) {
          showToast(`Kode diskon "${formData.nama_diskon}" berhasil diperbarui.`);
          setIsModalOpen(false);
          await loadDiscounts();
        }
      } else {
        const res = await createAdminDiscount(formData);
        if (res.status) {
          showToast(`Kode promo "${formData.nama_diskon}" berhasil dibuat.`);
          setIsModalOpen(false);
          await loadDiscounts();
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const discountId = deleteTarget.id_diskon ?? deleteTarget.id ?? 0;
      const res = await deleteAdminDiscount(discountId);
      if (res.status) {
        showToast(`Diskon "${deleteTarget.nama_diskon}" berhasil dihapus.`);
        setDeleteTarget(null);
        await loadDiscounts();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Program Promosi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Kelola Diskon & Promo
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Atur kupon voucher, persentase potongan harga (1-100%), dan masa berlaku kode reservasi.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Buat Kode Diskon
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : discounts.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Tidak Ada Diskon Aktif"
          description="Belum ada kode promo potongan harga yang dibuat."
          actionLabel="Buat Promo Pertama"
          onAction={openCreateModal}
        />
      ) : (
        <div className="card-luxury rounded-2xl overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Kode Promo</th>
                  <th className="px-5 py-3.5">Potongan</th>
                  <th className="px-5 py-3.5">Periode Berlaku</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {discounts.map((d) => (
                  <tr key={d.id_diskon} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono bg-zinc-800/90 px-2.5 py-1 rounded-md border border-zinc-700/60 tracking-wider">
                          {d.nama_diskon}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-emerald-400">
                        {d.persentase_diskon}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-300 text-xs font-sans">
                      {d.tanggal_awal} s/d {d.tanggal_akhir}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="success" size="sm">
                        Aktif
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(d)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(d)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Hapus
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

      {/* Modal: Create / Edit Discount */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDiscount ? 'Perbarui Kode Diskon' : 'Buat Kode Diskon Baru'}
        description="Pengunjung dapat memasukkan kode promo ini saat melakukan reservasi workstation."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            label="Kode Promo"
            required
            placeholder="Contoh: DISKONHEMAT20"
            value={formData.nama_diskon}
            onChange={(e) =>
              setFormData({ ...formData, nama_diskon: e.target.value.toUpperCase() })
            }
            error={formErrors.nama_diskon}
            helperText="Gunakan huruf kapital dan angka tanpa spasi."
          />

          <Input
            label="Persentase Potongan (%)"
            type="number"
            required
            min={1}
            max={100}
            placeholder="20"
            value={formData.persentase_diskon}
            onChange={(e) =>
              setFormData({ ...formData, persentase_diskon: Number(e.target.value) })
            }
            error={formErrors.persentase_diskon}
            helperText="Nilai antara 1% hingga 100%."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tanggal Mulai Berlaku"
              type="date"
              required
              value={formData.tanggal_awal}
              onChange={(e) =>
                setFormData({ ...formData, tanggal_awal: e.target.value })
              }
              error={formErrors.tanggal_awal}
            />

            <Input
              label="Tanggal Berakhir"
              type="date"
              required
              value={formData.tanggal_akhir}
              onChange={(e) =>
                setFormData({ ...formData, tanggal_akhir: e.target.value })
              }
              error={formErrors.tanggal_akhir}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              {editingDiscount ? 'Simpan Perubahan' : 'Terbitkan Promo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kode Diskon?"
        description={`Apakah Anda yakin ingin menghapus kode promo "${deleteTarget?.nama_diskon}"?`}
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(null)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={handleDeleteConfirm}
          >
            Ya, Hapus Promo
          </Button>
        </div>
      </Modal>
    </div>
  );
}
