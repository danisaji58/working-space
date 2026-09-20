'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  getAdminMembers,
  createAdminMember,
  getAdminMemberById,
  updateAdminMember,
  deleteAdminMember,
  uploadMemberImage,
} from '@/lib/api/admin';
import { Member } from '@/types/api';
import {
  resolveMemberImage,
  saveUploadedImageCache,
  normalizeUploadUrl,
} from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { LoadingSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    nama_member: '',
    username: '',
    password: '',
    instansi: '',
    telp: '',
    alamat: '',
    foto: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminMembers(searchQuery);
      if (res.status && res.data) {
        setMembers(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadMembers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = () => {
    setEditingMember(null);
    setUploadStatus('idle');
    setSubmitError(null);
    const defaultAvatar = '';
    setFormData({
      nama_member: '',
      username: '',
      password: '',
      instansi: '',
      telp: '',
      alamat: '',
      foto: defaultAvatar,
    });
    setPreviewUrl(defaultAvatar);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Endpoint 29: GET /api/admin/members/{id}
  const openEditModal = async (member: Member) => {
    setEditingMember(member);
    setUploadStatus('idle');
    setSubmitError(null);
    const targetId = member.id_member || member.id || 0;
    const initialFoto = member.foto || '';

    // Set immediate defaults
    setFormData({
      nama_member: member.nama_member,
      username: member.username,
      password: '',
      instansi: member.instansi,
      telp: member.telp,
      alamat: member.alamat,
      foto: initialFoto,
    });
    setPreviewUrl(resolveMemberImage(member));
    setFormErrors({});
    setIsModalOpen(true);

    // Fetch fresh detail via Endpoint 29 without overwriting user's newly uploaded image
    if (targetId) {
      try {
        const detailRes = await getAdminMemberById(targetId);
        if (detailRes.status && detailRes.data) {
          const d = detailRes.data;
          setFormData((prev) => {
            const hasUserChangedFoto = prev.foto !== initialFoto;
            return {
              nama_member: d.nama_member || member.nama_member,
              username: d.username || member.username,
              password: prev.password || '',
              instansi: d.instansi || member.instansi,
              telp: d.telp || member.telp,
              alamat: d.alamat || member.alamat,
              foto: hasUserChangedFoto ? prev.foto : (d.foto || d.foto_url || initialFoto),
            };
          });
          setPreviewUrl((prev) => {
            const initialResolved = resolveMemberImage(member);
            const hasUserChangedPreview = prev !== initialResolved;
            return hasUserChangedPreview ? prev : resolveMemberImage(d);
          });
        }
      } catch {
        // use existing data
      }
    }
  };

  // Endpoint 50: POST /api/upload/members with instant Base64 preview & server normalization
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');

    // 1. Read Base64 immediately so preview updates without delay and works offline/fallback
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPreviewUrl(base64);
        setFormData((prev) => ({ ...prev, foto: base64 }));

        const memberId = editingMember?.id_member ?? editingMember?.id;
        if (memberId) {
          saveUploadedImageCache('members', memberId, base64);
        }
      }

      // 2. Upload to official server Endpoint 50
      try {
        const res = await uploadMemberImage(file);
        if (res.status && res.data) {
          const serverUrl = res.data.url || res.data.filename;
          const normalized = normalizeUploadUrl(serverUrl, 'members');

          setFormData((prev) => ({
            ...prev,
            foto: normalized,
          }));
          setPreviewUrl(normalized);

          const memberId = editingMember?.id_member ?? editingMember?.id;
          if (memberId) {
            saveUploadedImageCache('members', memberId, normalized);
          }
          setUploadStatus('done');
        } else {
          // Keep Base64 so image never disappears
          setUploadStatus('done');
        }
      } catch {
        // Keep Base64 in formData.foto
        setUploadStatus('done');
      }
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nama_member.trim()) errs.nama_member = 'Nama lengkap wajib diisi';
    if (!formData.username.trim()) errs.username = 'Username wajib diisi';
    if (!formData.instansi.trim()) errs.instansi = 'Instansi wajib diisi';
    if (!formData.telp.trim()) errs.telp = 'Nomor telepon wajib diisi';
    if (!formData.alamat.trim()) errs.alamat = 'Alamat wajib diisi';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError(null);
    setIsSaving(true);
    try {
      const finalPhoto = previewUrl || formData.foto;

      if (editingMember) {
        const targetId = editingMember.id_member || editingMember.id || 0;
        if (finalPhoto) {
          saveUploadedImageCache('members', targetId, normalizeUploadUrl(finalPhoto, 'members'));
        }
        const res = await updateAdminMember(targetId, { ...formData, foto: finalPhoto });
        if (res.status) {
          showToast(`Data member "${formData.nama_member}" berhasil diperbarui.`);
          setIsModalOpen(false);
          await loadMembers();
        } else {
          setSubmitError(res.message || 'Gagal memperbarui data member.');
        }
      } else {
        const payloadToCreate = {
          ...formData,
          foto: finalPhoto,
          password: formData.password.trim() || 'Password123!',
        };
        const res = await createAdminMember(payloadToCreate);
        if (res.status) {
          const newId = res.data?.id_member ?? res.data?.id;
          if (newId && finalPhoto) {
            saveUploadedImageCache('members', newId, normalizeUploadUrl(finalPhoto, 'members'));
          }
          showToast(`Member "${formData.nama_member}" berhasil ditambahkan.`);
          setIsModalOpen(false);
          await loadMembers();
        } else {
          setSubmitError(res.message || 'Gagal menambahkan member.');
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setSubmitError(error.message || 'Terjadi kesalahan sistem saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id_member || deleteTarget.id || 0;
    setIsDeleting(true);
    try {
      const res = await deleteAdminMember(targetId);
      if (res.status) {
        showToast(`Member "${deleteTarget.nama_member}" berhasil dihapus.`);
        setDeleteTarget(null);
        await loadMembers();
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Data Member & Pengunjung
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Daftar member terdaftar, riwayat instansi, kontak telepon, dan verifikasi akun.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Tambah Member
        </Button>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, username, instansi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tidak Ada Member Ditemukan"
          description="Coba ubah kata kunci pencarian atau tambah member baru."
          actionLabel="Tambah Member Baru"
          onAction={openCreateModal}
        />
      ) : (
        <div className="card-luxury rounded-2xl overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase">
                <tr>
                  <th className="px-4 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Instansi</th>
                  <th className="px-4 py-3.5">Kontak</th>
                  <th className="px-4 py-3.5">Alamat</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {members.map((member) => (
                  <tr
                    key={member.id_member || member.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={member.foto}
                          name={member.nama_member}
                          id={member.id_member || member.id}
                          size="md"
                        />
                        <div>
                          <div className="font-semibold text-white">
                            {member.nama_member}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            @{member.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-300">
                      {member.instansi}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-300">
                      {member.telp}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400 max-w-xs truncate">
                      {member.alamat}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(member)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(member)}
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

      {/* Modal: Create / Edit Member */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Perbarui Data Member' : 'Tambah Member Baru'}
        description="Masukkan identitas lengkap pengunjung coworking space."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {submitError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              {submitError}
            </div>
          )}

          <Input
            label="Nama Lengkap"
            required
            placeholder="Ahmad Fauzi"
            value={formData.nama_member}
            onChange={(e) => setFormData({ ...formData, nama_member: e.target.value })}
            error={formErrors.nama_member}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Username"
              required
              placeholder="ahmad_fauzi"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={formErrors.username}
            />

            <Input
              label="Nomor Telepon"
              required
              type="tel"
              placeholder="081234567890"
              value={formData.telp}
              onChange={(e) => setFormData({ ...formData, telp: e.target.value })}
              error={formErrors.telp}
            />
          </div>

          <Input
            label={editingMember ? 'Password Baru (Opsional)' : 'Password Akun Member'}
            type="password"
            placeholder={editingMember ? 'Kosongkan jika tidak ingin diubah' : 'Minimal 6 karakter (default: Password123!)'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText={editingMember ? 'Hanya isi jika ingin mereset password member ini.' : 'Password sementara untuk login member.'}
          />

          <Input
            label="Instansi / Asal Lembaga"
            required
            placeholder="SMK Telkom Malang / Universitas Brawijaya"
            value={formData.instansi}
            onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
            error={formErrors.instansi}
          />

          <Textarea
            label="Alamat Lengkap"
            required
            rows={2}
            placeholder="Alamat domisili pengunjung..."
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            error={formErrors.alamat}
          />

          <div className="space-y-2">
            <Input
              label="URL Foto Profil"
              placeholder="https://..."
              value={formData.foto}
              onChange={(e) => {
                setFormData({ ...formData, foto: e.target.value });
                setPreviewUrl(e.target.value);
              }}
              helperText="URL langsung atau unggah berkas foto dari komputer di bawah."
            />
            <div className="flex items-center gap-3 pt-1">
              {/* Avatar Live Preview */}
              <UserAvatar
                src={previewUrl || formData.foto}
                name={formData.nama_member || 'Member'}
                size="lg"
              />

              <div className="flex flex-col gap-1.5">
                <label className="inline-flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 px-3 py-1.5 rounded-lg cursor-pointer transition-colors w-fit">
                  <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>{uploadStatus === 'uploading' ? 'Mengunggah...' : 'Unggah Foto dari Komputer'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadStatus === 'uploading'}
                  />
                </label>
                {uploadStatus === 'done' && (
                  <span className="text-[11px] text-emerald-400 font-mono">✓ Foto tersimpan & siap digunakan</span>
                )}
                {uploadStatus === 'error' && (
                  <span className="text-[11px] text-rose-400 font-mono">⚠ Gagal mengunggah foto</span>
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
              {editingMember ? 'Simpan Perubahan' : 'Daftarkan Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Delete */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Data Member?"
        description={`Apakah Anda yakin ingin menghapus data member "${deleteTarget?.nama_member}"?`}
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
            Ya, Hapus Member
          </Button>
        </div>
      </Modal>
    </div>
  );
}
