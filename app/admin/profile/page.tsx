'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Phone,
  Sparkles,
  CheckCircle2,
  Save,
  ShieldCheck,
  MapPin,
  Wifi,
  Clock,
  Ticket,
  FileText,
  BadgeCheck,
  ExternalLink
} from 'lucide-react';
import { getAdminProfile, updateAdminProfile } from '@/lib/api/admin';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSkeleton } from '@/components/ui/EmptyState';

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth();
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
        setToastMessage('Profil coworking space berhasil diperbarui dan disinkronkan ke seluruh sistem.');
        // Update auth context session if applicable
        updateUser({
          nama_coworking: formData.nama_coworking,
        });
        setTimeout(() => setToastMessage(null), 3500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Brand Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/90 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(197,168,128,0.12),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-[#c5a880] shadow-md shrink-0">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified Coworking Venue
                </span>
              </div>

              {/* <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {formData.nama_coworking || user?.nama_coworking || 'The Hive Coworking'}
              </h1> */}
              <p className="text-xs text-zinc-400 font-mono">
                Penanggung Jawab: <span className="text-zinc-200">{formData.nama_pemilik || user?.nama || 'Admin Utama'}</span> • Kontak: {formData.telp || '0812-3456-7890'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-zinc-400 font-mono uppercase block">Sistem Terintegrasi</span>
              <span className="text-xs font-semibold text-[#dfcbb5] font-mono">E-Ticket & QR Scanner</span>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Form & Live E-Ticket Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-luxury p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6">
            <div className="space-y-1 border-b border-zinc-800/80 pb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Informasi Resmi & Legalitas Venue
              </h2>
              <p className="text-xs text-zinc-400">
                Informasi ini ditampilkan di seluruh tanda terima, invoice, e-ticket member, dan halaman informasi publik.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nama Resmi Coworking Space"
                required
                value={formData.nama_coworking}
                onChange={(e) => setFormData({ ...formData, nama_coworking: e.target.value })}
                leftIcon={<Building2 className="w-4 h-4" />}
                placeholder="Contoh: The Hive Coworking & Atelier"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Pemilik / Penanggung Jawab"
                  required
                  value={formData.nama_pemilik}
                  onChange={(e) => setFormData({ ...formData, nama_pemilik: e.target.value })}
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder="Contoh: Budi Santoso, S.Kom"
                />

                <Input
                  label="Nomor Telepon Hotline Resmi"
                  required
                  type="tel"
                  value={formData.telp}
                  onChange={(e) => setFormData({ ...formData, telp: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                  placeholder="Contoh: 0812-3456-7890"
                />
              </div>

              <Textarea
                label="Alamat Lengkap Lokasi Gedung"
                required
                rows={2}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Contoh: Jl. Danau Ranau No. 1, Sawojajar, Kedungkandang, Kota Malang, Jawa Timur"
              />

              <Textarea
                label="Deskripsi Fasilitas & Layanan Unggulan"
                required
                rows={4}
                value={formData.deskripsi_fasilitas}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi_fasilitas: e.target.value })
                }
                helperText="Deskripsikan konektivitas simetris fiber optic, ketersediaan generator UPS backup, sistem smart lock, loker pribadi, dan barista lounge."
                placeholder="Deskripsi fasilitas coworking..."
              />

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">
                  Terakhir disinkronkan: Hari ini
                </span>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Simpan Perubahan Profil
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live E-Ticket / Receipt Preview & Standard Badges */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Card */}
          <div className="card-luxury p-6 rounded-3xl border border-zinc-800 space-y-4 bg-zinc-950/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#c5a880]" />
                <h3 className="text-sm font-bold text-white">
                  Pratinjau Tiket Pengunjung
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Live Preview</span>
            </div>

            {/* Mocked E-Ticket Header */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono text-xs">
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                <div>
                  <div className="font-bold text-white text-sm">
                    {formData.nama_coworking || 'The Hive Coworking'}
                  </div>
                  <div className="text-[10px] text-[#c5a880] uppercase tracking-wider">
                    E-Ticket Akses Ruang
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 text-right">
                  <div>Hotline: {formData.telp || '-'}</div>
                  <div className="text-emerald-400">Valid Check-in</div>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-zinc-300">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400 line-clamp-2">
                    {formData.alamat || 'Alamat gedung coworking...'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[10px] text-zinc-400 space-y-1">
                <div className="text-zinc-300 font-semibold uppercase">Fasilitas Standar:</div>
                <p className="line-clamp-2 leading-relaxed">
                  {formData.deskripsi_fasilitas || 'Konektivitas optical fiber 1Gbps, free-flow artisan coffee, smart keycard.'}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-tight">
              Format header di atas otomatis dicetak pada E-Ticket digital PDF dan struk pembayaran setiap reservasi member.
            </p>
          </div>

          {/* Quick Facility Checklist */}
          <div className="card-luxury p-6 rounded-3xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Standar Operasional Ruang
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <Wifi className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>Dedicated Gateway 1 Gbps Fiber</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <Clock className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>Akses Scanner Mandiri 24 Jam</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <FileText className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span>Faktur & Tiket Pajak Terintegrasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
