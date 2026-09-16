'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  getAdminSpaces,
  getAdminSpaceById,
  createAdminSpace,
  updateAdminSpace,
  deleteAdminSpace,
  uploadSpaceImage,
  uploadImage,
} from '@/lib/api/admin';
import { Space, SpaceType } from '@/types/api';
import { formatIDR, getSpaceTypeLabel, resolveSpaceImage } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton, EmptyState } from '@/components/ui/EmptyState';

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [formData, setFormData] = useState({
    nama_space: '',
    harga_per_jam: 25000,
    tipe: 'desk' as SpaceType,
    kapasitas: 1,
    deskripsi: '',
    foto: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Space | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadSpaces = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminSpaces();
      if (res.status && res.data) {
        setSpaces(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingSpace(null);
    setFormData({
      nama_space: '',
      harga_per_jam: 25000,
      tipe: 'desk',
      kapasitas: 1,
      deskripsi: '',
      foto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    });
    setPreviewUrl('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
    setUploadStatus('idle');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = async (space: Space) => {
    setEditingSpace(space);
    const currentFoto = space.foto || '';
    setFormData({
      nama_space: space.nama_space,
      harga_per_jam: space.harga_per_jam,
      tipe: space.tipe,
      kapasitas: space.kapasitas,
      deskripsi: space.deskripsi,
      foto: currentFoto,
    });
    setPreviewUrl(resolveSpaceImage(space));
    setUploadStatus('idle');
    setFormErrors({});
    setIsModalOpen(true);

    // Fetch fresh details via Endpoint 34
    const targetId = space.id_space || space.id;
    if (targetId) {
      try {
        const detailRes = await getAdminSpaceById(targetId);
        if (detailRes.status && detailRes.data) {
          const s = detailRes.data;
          setFormData({
            nama_space: s.nama_space,
            harga_per_jam: s.harga_per_jam,
            tipe: s.tipe,
            kapasitas: s.kapasitas,
            deskripsi: s.deskripsi,
            foto: s.foto || '',
          });
          setPreviewUrl(resolveSpaceImage(s));
        }
      } catch {
        // use initial space data
      }
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nama_space.trim()) errs.nama_space = 'Nama ruang wajib diisi';
    if (!formData.harga_per_jam || formData.harga_per_jam < 1000) {
      errs.harga_per_jam = 'Tarif per jam minimal Rp 1.000';
    }
    if (!formData.kapasitas || formData.kapasitas < 1) {
      errs.kapasitas = 'Kapasitas minimal 1 orang';
    }
    if (!formData.deskripsi.trim()) errs.deskripsi = 'Deskripsi ruang wajib diisi';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (editingSpace) {
        const spaceId = editingSpace.id_space ?? editingSpace.id ?? 0;
        const res = await updateAdminSpace(spaceId, formData);
        if (res.status) {
          showToast(`Ruang "${formData.nama_space}" berhasil diperbarui.`);
          setIsModalOpen(false);
          await loadSpaces();
        }
      } else {
        const res = await createAdminSpace(formData);
        if (res.status) {
          showToast(`Ruang "${formData.nama_space}" berhasil ditambahkan.`);
          setIsModalOpen(false);
          await loadSpaces();
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
      const spaceId = deleteTarget.id_space ?? deleteTarget.id ?? 0;
      const res = await deleteAdminSpace(spaceId);
      if (res.status) {
        showToast(`Ruang "${deleteTarget.nama_space}" berhasil dihapus.`);
        setDeleteTarget(null);
        await loadSpaces();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately show a local preview so admin can see the selected image
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadStatus('uploading');

    try {
      const res = await uploadSpaceImage(file);
      if (res.status && res.data?.url) {
        // Server returned a permanent URL — use it
        setFormData((prev) => ({ ...prev, foto: res.data.url }));
        setPreviewUrl(res.data.url);
        setUploadStatus('done');
      } else {
        // Upload endpoint not available / returned no URL
        // Keep the local object URL as preview, but warn admin
        setFormData((prev) => ({ ...prev, foto: localUrl }));
        setUploadStatus('error');
      }
    } catch {
      setFormData((prev) => ({ ...prev, foto: localUrl }));
      setUploadStatus('error');
    }

    // Reset the file input so the same file can be re-selected
    e.target.value = '';
  };

  const filteredSpaces = spaces.filter(
    (s) =>
      s.nama_space.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tipe.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inventaris Properti</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Kelola Ruang Kerja & Workstation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Tambah, perbarui tarif per jam, kapasitas, dan spesifikasi fasilitas ruang.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Tambah Ruang Baru
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          placeholder="Cari nama ruang kerja..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        />
      </div>

      {/* Spaces Data Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : filteredSpaces.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Tidak Ada Data Ruang"
          description="Belum ada unit workstation yang ditambahkan ke inventaris."
          actionLabel="Tambah Ruang Sekarang"
          onAction={openCreateModal}
        />
      ) : (
        <div className="card-luxury rounded-2xl overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase">
                <tr>
                  <th className="px-4 py-3.5">Unit Ruang</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Kapasitas</th>
                  <th className="px-4 py-3.5">Tarif / Jam</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredSpaces.map((space) => {
                  const spaceId = space.id_space ?? space.id ?? 1;
                  return (
                  <tr key={spaceId} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                          <Image
                            src={resolveSpaceImage(space)}
                            alt={space.nama_space}
                            fill
                            unoptimized
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="font-sans">
                          <div className="font-semibold text-white">
                            {space.nama_space}
                          </div>
                          <div className="text-[10px] text-zinc-400 line-clamp-1 max-w-xs">
                            {space.deskripsi}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <Badge variant="accent" size="sm">
                        {getSpaceTypeLabel(space.tipe)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-200">
                      {space.kapasitas} Orang
                    </td>
                    <td className="px-4 py-3.5 text-white font-semibold">
                      {formatIDR(space.harga_per_jam)}
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Aktif</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(space)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(space)}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Hapus
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

      {/* Modal: Create / Edit Space */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpace ? 'Perbarui Data Ruang Kerja' : 'Tambah Ruang Kerja Baru'}
        description="Lengkapi detail spesifikasi unit workstation untuk dipublikasikan pada katalog member."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          <Input
            label="Nama Ruang Kerja"
            required
            placeholder="Contoh: Atelier Focus Desk C-02"
            value={formData.nama_space}
            onChange={(e) => setFormData({ ...formData, nama_space: e.target.value })}
            error={formErrors.nama_space}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Kategori / Tipe <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.tipe}
                onChange={(e) =>
                  setFormData({ ...formData, tipe: e.target.value as SpaceType })
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
              >
                <option value="desk">Personal Desk</option>
                <option value="meeting_room">Meeting Room</option>
                <option value="private_office">Private Office</option>
              </select>
            </div>

            <Input
              label="Tarif per Jam (IDR)"
              type="number"
              required
              min={1000}
              step={1000}
              value={formData.harga_per_jam}
              onChange={(e) =>
                setFormData({ ...formData, harga_per_jam: Number(e.target.value) })
              }
              error={formErrors.harga_per_jam}
            />

            <Input
              label="Kapasitas (Orang)"
              type="number"
              required
              min={1}
              value={formData.kapasitas}
              onChange={(e) =>
                setFormData({ ...formData, kapasitas: Number(e.target.value) })
              }
              error={formErrors.kapasitas}
            />
          </div>

          <Textarea
            label="Deskripsi & Fasilitas"
            required
            rows={3}
            placeholder="Tuliskan spesifikasi monitor, ergonomi kursi, daya listrik, dan fasilitas ruangan..."
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            error={formErrors.deskripsi}
          />

          {/* Photo URL & File Upload */}
          <div className="space-y-2">
            <Input
              label="URL Foto Ruangan"
              placeholder="https://images.unsplash.com/..."
              value={formData.foto}
              onChange={(e) => {
                setFormData({ ...formData, foto: e.target.value });
                setPreviewUrl(e.target.value);
              }}
              helperText="Tempel tautan gambar atau unggah file foto lokal di bawah."
            />

            <div className="flex items-start gap-3">
              {/* Live Photo Preview */}
              {previewUrl && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview foto"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=60'; }}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadStatus === 'uploading' ? 'Mengunggah...' : 'Unggah Foto dari Komputer'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadStatus === 'uploading'}
                    className="hidden"
                  />
                </label>
                {uploadStatus === 'done' && (
                  <span className="text-[11px] text-emerald-400">✓ Foto berhasil diunggah ke server</span>
                )}
                {uploadStatus === 'error' && (
                  <span className="text-[11px] text-amber-400">⚠ Server upload gagal. URL foto mungkin tidak tersimpan permanen.</span>
                )}
              </div>
            </div>
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
              {editingSpace ? 'Simpan Perubahan' : 'Terbitkan Ruang'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Ruang Kerja?"
        description={`Anda akan menghapus unit "${deleteTarget?.nama_space}" dari inventaris.`}
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
            Ya, Hapus Ruang
          </Button>
        </div>
      </Modal>
    </div>
  );
}
