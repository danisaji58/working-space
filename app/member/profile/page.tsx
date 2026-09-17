'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import {
  Building,
  Phone,
  MapPin,
  LogOut,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  X,
  User,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { resolveMemberImage, saveUploadedImageCache, normalizeUploadUrl, FALLBACK_MEMBER_AVATARS } from '@/lib/utils';
import { uploadMemberImage, updateAdminMember } from '@/lib/api/admin';

export default function MemberProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    telp: '',
    instansi: '',
    alamat: '',
    foto: '',
  });
  const [modalPreview, setModalPreview] = useState<string>('');
  const [avatarError, setAvatarError] = useState(false);
  const [modalAvatarError, setModalAvatarError] = useState(false);

  React.useEffect(() => {
    setAvatarError(false);
  }, [user?.foto]);

  React.useEffect(() => {
    setModalAvatarError(false);
  }, [modalPreview]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 4500);
  };

  // Direct avatar file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Berkas harus berupa gambar (JPG, PNG, WebP).', true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Ukuran gambar maksimal 5MB.', true);
      return;
    }

    setIsUploading(true);

    // Read base64 immediately for zero-lag instant preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;

      // Update session immediately with base64 preview
      updateUser({ foto: base64Url });
      if (user?.id) {
        saveUploadedImageCache('members', user.id, base64Url);
      }

      try {
        // Upload to server
        const uploadRes = await uploadMemberImage(file);
        let finalPhotoUrl = base64Url;

        if (uploadRes.status && uploadRes.data?.url) {
          finalPhotoUrl = normalizeUploadUrl(uploadRes.data.url, 'members');
          updateUser({ foto: finalPhotoUrl });
          if (user?.id) {
            saveUploadedImageCache('members', user.id, finalPhotoUrl);
            // Sync to backend member record if user has ID
            try {
              await updateAdminMember(user.id, { foto: finalPhotoUrl });
            } catch {
              // Ignore background sync errors
            }
          }
        }

        showNotification('Foto profil berhasil diperbarui dan disimpan!');
      } catch (err) {
        console.warn('Server upload error, using local base64 fallback:', err);
        showNotification('Foto profil tersimpan pada perangkat Anda.');
      } finally {
        setIsUploading(false);
        if (e.target) e.target.value = '';
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      showNotification('Gagal membaca berkas foto.', true);
    };

    reader.readAsDataURL(file);
  };

  // Reset photo
  const handleResetPhoto = () => {
    updateUser({ foto: '' });
    if (user?.id) {
      saveUploadedImageCache('members', user.id, '');
    }
    showNotification('Foto profil dikembalikan ke avatar bawaan.');
  };

  // Open edit profile modal
  const openEditProfile = () => {
    setFormData({
      nama: user?.nama || '',
      telp: user?.telp || '',
      instansi: user?.instansi || '',
      alamat: user?.alamat || '',
      foto: user?.foto || '',
    });
    setModalPreview(resolveMemberImage(user));
    setIsEditModalOpen(true);
  };

  // Modal file upload
  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Berkas harus berupa gambar.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      setModalPreview(base64Url);
      setFormData((prev) => ({ ...prev, foto: base64Url }));

      try {
        const uploadRes = await uploadMemberImage(file);
        if (uploadRes.status && uploadRes.data?.url) {
          const normalized = normalizeUploadUrl(uploadRes.data.url, 'members');
          setFormData((prev) => ({ ...prev, foto: normalized }));
          setModalPreview(normalized);
        }
      } catch (err) {
        console.warn('Server upload error in modal:', err);
      }
      if (e.target) e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedData = {
      nama: formData.nama.trim(),
      telp: formData.telp.trim(),
      instansi: formData.instansi.trim(),
      alamat: formData.alamat.trim(),
      foto: formData.foto.trim() || undefined,
    };

    updateUser(updatedData);

    if (user?.id && updatedData.foto) {
      saveUploadedImageCache('members', user.id, updatedData.foto);
    }

    if (user?.id) {
      try {
        await updateAdminMember(user.id, updatedData);
      } catch (err) {
        console.warn('Could not sync profile to backend:', err);
      }
    }

    setIsSaving(false);
    setIsEditModalOpen(false);
    showNotification('Data profil berhasil diperbarui!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pengaturan Akun & Profil</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Profil Member Pengunjung
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Kelola data identitas, foto profil, dan informasi kontak coworking space Anda.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={openEditProfile}
          leftIcon={<Edit3 className="w-4 h-4 text-[#c5a880]" />}
          className="self-start sm:self-auto"
        >
          Edit Profil
        </Button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="flex-1">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Profile Card */}
      <div className="card-luxury p-6 sm:p-8 rounded-3xl space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-zinc-800/80">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-zinc-800 border-2 border-zinc-700/80 shadow-xl group-hover:border-[#c5a880]/60 transition-colors">
              <Image
                src={avatarError ? FALLBACK_MEMBER_AVATARS[0] : resolveMemberImage(user)}
                alt={user?.nama || 'Member'}
                fill
                unoptimized
                sizes="96px"
                className="object-cover"
                onError={() => setAvatarError(true)}
              />

              {/* Uploading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-[#c5a880] gap-1 z-20">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[9px] font-mono font-semibold">Mengunggah...</span>
                </div>
              )}

              {/* Hover Quick Action */}
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Klik untuk mengganti foto profil"
                  className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10"
                >
                  <Camera className="w-6 h-6 text-[#c5a880] mb-0.5" />
                  <span className="text-[9px] font-semibold">Ganti Foto</span>
                </button>
              )}
            </div>

            {/* Quick camera floating badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Unggah foto profil"
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#c5a880] text-zinc-300 hover:text-white shadow-lg flex items-center justify-center transition-colors"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-[#c5a880] animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-[#c5a880]" />
              )}
            </button>
          </div>

          {/* Member Identity & Upload Action Buttons */}
          <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white tracking-tight truncate">
                  {user?.nama || 'Member Pengunjung'}
                </h2>
                <Badge variant="accent" size="sm">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Member
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                @{user?.username || 'member'} • Identitas Pengunjung Coworking
              </p>
            </div>

            {/* Action Buttons for Avatar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                leftIcon={<Upload className="w-3.5 h-3.5 text-[#c5a880]" />}
                className="text-xs py-1.5 px-3"
              >
                Unggah Foto dari Komputer
              </Button>

              {user?.foto && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPhoto}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5 text-zinc-400" />}
                  className="text-xs py-1.5 px-3 text-zinc-400 hover:text-rose-400"
                >
                  Reset Foto
                </Button>
              )}
            </div>

            <p className="text-[11px] text-zinc-400">
              Mendukung JPG, PNG, atau WebP (maks. 5MB). Foto akan langsung tampil di navbar dan profil.
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <Building className="w-3.5 h-3.5 text-zinc-400" />
              <span>Instansi / Lembaga</span>
            </div>
            <div className="text-sm font-semibold text-white">
              {user?.instansi || 'SMK Telkom Malang'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>Nomor Telepon</span>
            </div>
            <div className="text-sm font-semibold text-white font-mono">
              {user?.telp || '0812-3456-7890'}
            </div>
          </div>

          <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="text-zinc-400 flex items-center gap-1.5 font-mono text-[10px] uppercase">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Alamat Domisili</span>
            </div>
            <div className="text-xs text-zinc-200 leading-relaxed">
              {user?.alamat || 'Jl. Danau Ranau, Sawojajar, Kota Malang, Jawa Timur'}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Sesi terenkripsi & sinkron dengan API Coworking</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={openEditProfile}
              leftIcon={<Edit3 className="w-4 h-4 text-[#c5a880]" />}
            >
              Ubah Data
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#111113] border border-zinc-800/90 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880]">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Edit Data Profil Member
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Perbarui nama, kontak, instansi, atau foto profil Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Section in Modal */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Foto Profil Member
                </label>

                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                    {modalPreview ? (
                      <Image
                        src={modalAvatarError ? FALLBACK_MEMBER_AVATARS[0] : modalPreview}
                        alt="Preview"
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                        onError={() => setModalAvatarError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      onChange={handleModalFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => modalFileInputRef.current?.click()}
                      leftIcon={<Upload className="w-3.5 h-3.5 text-[#c5a880]" />}
                      className="text-xs"
                    >
                      Pilih Berkas dari Komputer
                    </Button>
                    <p className="text-[10px] text-zinc-400">
                      Pilih gambar dari komputer atau tempel URL gambar di bawah.
                    </p>
                  </div>
                </div>

                <Input
                  label="Tautan URL Foto (Opsional)"
                  type="text"
                  placeholder="https://... atau biarkan kosong"
                  value={formData.foto}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, foto: val }));
                    if (val.trim()) {
                      setModalPreview(normalizeUploadUrl(val.trim(), 'members'));
                    } else {
                      setModalPreview(resolveMemberImage(user));
                    }
                  }}
                />
              </div>

              {/* Name */}
              <Input
                label="Nama Lengkap"
                type="text"
                required
                placeholder="Contoh: Ahmad Fauzi"
                value={formData.nama}
                onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                leftIcon={<User className="w-4 h-4" />}
              />

              {/* Phone */}
              <Input
                label="Nomor Telepon / WhatsApp"
                type="text"
                required
                placeholder="Contoh: 0812-3456-7890"
                value={formData.telp}
                onChange={(e) => setFormData((prev) => ({ ...prev, telp: e.target.value }))}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              {/* Instansi */}
              <Input
                label="Instansi / Asal Lembaga"
                type="text"
                placeholder="Contoh: SMK Telkom Malang / Universitas Brawijaya"
                value={formData.instansi}
                onChange={(e) => setFormData((prev) => ({ ...prev, instansi: e.target.value }))}
                leftIcon={<Building className="w-4 h-4" />}
              />

              {/* Alamat */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Alamat Domisili</span>
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a880] transition-colors resize-none"
                  placeholder="Masukkan alamat domisili lengkap..."
                  value={formData.alamat}
                  onChange={(e) => setFormData((prev) => ({ ...prev, alamat: e.target.value }))}
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
