'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerMember } from '@/lib/api/auth';
import { uploadMemberImage } from '@/lib/api/admin';
import { useAuth } from '@/context/auth-context';
import { resolveMemberImage, normalizeUploadUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  User,
  Building,
  Phone,
  Lock,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
} from 'lucide-react';

export default function RegisterMemberPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    nama_member: '',
    instansi: '',
    telp: '',
    alamat: '',
    username: '',
    password: '',
    foto: '',
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');

    // 1. Read Base64 immediately so preview updates without delay
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPreviewUrl(base64);
        setFormData((prev) => ({ ...prev, foto: base64 }));
      }

      // 2. Try upload to server
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
          setUploadStatus('done');
        } else {
          setUploadStatus('done');
        }
      } catch {
        setUploadStatus('done');
      }
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nama_member.trim()) errs.nama_member = 'Nama lengkap wajib diisi';
    if (!formData.instansi.trim()) errs.instansi = 'Instansi / sekolah / perusahaan wajib diisi';
    if (!formData.telp.trim()) errs.telp = 'Nomor telepon wajib diisi';
    else if (!/^08[0-9]{8,12}$/.test(formData.telp.replace(/\D/g, ''))) {
      errs.telp = 'Format nomor telepon tidak valid (contoh: 081234567890)';
    }
    if (!formData.alamat.trim()) errs.alamat = 'Alamat domisili wajib diisi';
    if (!formData.username.trim()) errs.username = 'Username wajib diisi';
    else if (formData.username.length < 3) errs.username = 'Username minimal 3 karakter';
    if (!formData.password) errs.password = 'Password wajib diisi';
    else if (formData.password.length < 6) errs.password = 'Password minimal 6 karakter';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setServerError(null);
    setIsLoading(true);

    try {
      const finalPhoto =
        previewUrl ||
        formData.foto ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

      const payload = {
        ...formData,
        foto: finalPhoto,
      };

      const res = await registerMember(payload);

      if (res.status) {
        setIsSuccess(true);
        // Auto-login newly registered member
        await login({ username: formData.username, password: formData.password });
        setTimeout(() => {
          router.push('/member');
        }, 1200);
      } else {
        setServerError(res.message || 'Registrasi gagal. Silakan periksa data Anda.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setServerError(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#0b0b0c] relative">
      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Pilihan Akun</span>
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Pendaftaran Akun Member
          </h1>
          <p className="text-xs text-zinc-400">
            Lengkapi formulir di bawah untuk menikmati fasilitas reservasi coworking space.
          </p>
        </div>

        {isSuccess ? (
          <div className="card-luxury p-8 rounded-2xl text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-white">Pendaftaran Berhasil!</h2>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto">
              Akun member Anda telah aktif. Mengalihkan Anda secara otomatis ke portal member...
            </p>
          </div>
        ) : (
          <div className="card-luxury p-6 sm:p-8 rounded-2xl">
            {serverError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  required
                  placeholder="Ahmad Fauzi"
                  value={formData.nama_member}
                  onChange={(e) => setFormData({ ...formData, nama_member: e.target.value })}
                  error={errors.nama_member}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Instansi / Perusahaan"
                  required
                  placeholder="SMK Telkom Malang / Polinema"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  error={errors.instansi}
                  leftIcon={<Building className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nomor Telepon"
                  required
                  type="tel"
                  placeholder="081234567890"
                  value={formData.telp}
                  onChange={(e) => setFormData({ ...formData, telp: e.target.value })}
                  error={errors.telp}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Foto Profil (URL)"
                  placeholder="https://..."
                  value={formData.foto}
                  onChange={(e) => {
                    setFormData({ ...formData, foto: e.target.value });
                    setPreviewUrl(e.target.value);
                  }}
                  helperText="URL langsung atau unggah berkas foto dari komputer di bawah."
                  leftIcon={<ImageIcon className="w-4 h-4" />}
                />
              </div>

              {/* Live Avatar Preview & Upload Button */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl || resolveMemberImage({ foto: formData.foto })}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.startsWith('data:') && !img.src.startsWith('blob:')) {
                        img.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=60';
                      }
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 px-3 py-1.5 rounded-lg cursor-pointer transition-colors w-fit font-medium">
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
                      <span className="text-[11px] text-emerald-400 font-mono">✓ Foto terpilih</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Mendukung JPG, PNG, WebP (maks 5MB)
                  </p>
                </div>
              </div>

              <Textarea
                label="Alamat Lengkap"
                required
                rows={2}
                placeholder="Jl. Danau Ranau No. 12, Sawojajar, Kota Malang"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                error={errors.alamat}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                <Input
                  label="Username Akun"
                  required
                  placeholder="ahmad_fauzi"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  error={errors.username}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Password"
                  required
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Selesaikan Pendaftaran Member
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-white hover:text-[#c5a880] font-medium underline underline-offset-4">
                Masuk di sini
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
