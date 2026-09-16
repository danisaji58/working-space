'use client';

import React, { useState, useEffect } from 'react';
import { Building2, User, Phone, Sparkles, CheckCircle2, Save } from 'lucide-react';
import { getAdminProfile, updateAdminProfile } from '@/lib/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSkeleton } from '@/components/ui/EmptyState';

export default function AdminProfilePage() {
  const [formData, setFormData] = useState({
    nama_coworking: '',
    nama_pemilik: '',
    alamat: '',
    telp: '',
    deskripsi_fasilitas: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const res = await getAdminProfile();
        if (res.status && res.data) {
          setFormData({
            nama_coworking: res.data.nama_coworking || '',
            nama_pemilik: res.data.nama_pemilik || '',
            alamat: res.data.alamat || '',
            telp: res.data.telp || '',
            deskripsi_fasilitas: res.data.deskripsi_fasilitas || '',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateAdminProfile(formData);
      if (res.status && res.data) {
        setToastMessage('Profil coworking space berhasil diperbarui.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pengaturan Fasilitas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Profil Coworking Space
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Informasi kontak resmi, nama pemilik, dan fasilitas utama yang ditampilkan pada tanda terima tiket pengunjung.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="card-luxury p-6 sm:p-8 rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Coworking Space"
            required
            value={formData.nama_coworking}
            onChange={(e) => setFormData({ ...formData, nama_coworking: e.target.value })}
            leftIcon={<Building2 className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Pemilik / Penanggung Jawab"
              required
              value={formData.nama_pemilik}
              onChange={(e) => setFormData({ ...formData, nama_pemilik: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Nomor Telepon Kontak"
              required
              type="tel"
              value={formData.telp}
              onChange={(e) => setFormData({ ...formData, telp: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Textarea
            label="Alamat Lengkap Coworking"
            required
            rows={2}
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
          />

          <Textarea
            label="Deskripsi Fasilitas & Layanan Unggulan"
            required
            rows={4}
            value={formData.deskripsi_fasilitas}
            onChange={(e) =>
              setFormData({ ...formData, deskripsi_fasilitas: e.target.value })
            }
            helperText="Deskripsikan koneksi internet, ketersediaan generator daya cadangan, sistem keamanan, dll."
          />

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Simpan Profil Coworking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
