'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { registerMember } from '@/lib/api/auth';
import { useAuth } from '@/context/auth-context';
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
} from 'lucide-react';
import {
  scaleIn,
  fadeInUp,
  alertSlideDown,
} from '@/components/ui/motion-variants';

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      const payload = {
        ...formData,
        foto: formData.foto || '',
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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#0b0b0c] relative overflow-hidden">
      {/* Ambient background glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.07),transparent_70%)] pointer-events-none"
      />

      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl space-y-6 relative z-10"
      >
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Pilihan Akun</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Title */}
        <motion.div variants={fadeInUp} className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Pendaftaran Akun Member
          </h1>
          <p className="text-xs text-zinc-400">
            Lengkapi formulir di bawah untuk menikmati fasilitas reservasi coworking space.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="card-luxury p-8 rounded-2xl text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white">Pendaftaran Berhasil!</h2>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                Akun member Anda telah aktif. Mengalihkan Anda secara otomatis ke portal member...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="card-luxury p-6 sm:p-8 rounded-2xl shadow-2xl"
            >
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    variants={alertSlideDown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mb-5 p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300"
                  >
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

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
                    onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                    helperText="Opsional. Kosongkan untuk avatar default."
                    leftIcon={<ImageIcon className="w-4 h-4" />}
                  />
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

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-4"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Selesaikan Pendaftaran Member
                  </Button>
                </motion.div>
              </form>

              <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
                Sudah memiliki akun?{' '}
                <Link href="/login" className="text-white hover:text-[#c5a880] font-medium underline underline-offset-4">
                  Masuk di sini
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
