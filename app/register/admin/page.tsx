'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { registerAdmin } from '@/lib/api/auth';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Building2,
  UserCheck,
  Phone,
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import {
  scaleIn,
  fadeInUp,
  alertSlideDown,
} from '@/components/ui/motion-variants';

export default function RegisterAdminPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    nama_coworking: '',
    nama_pemilik: '',
    telp: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nama_coworking.trim()) errs.nama_coworking = 'Nama coworking space wajib diisi';
    if (!formData.nama_pemilik.trim()) errs.nama_pemilik = 'Nama pemilik / penanggung jawab wajib diisi';
    if (!formData.telp.trim()) errs.telp = 'Nomor telepon wajib diisi';
    if (!formData.username.trim()) errs.username = 'Username admin wajib diisi';
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
      const res = await registerAdmin(formData);

      if (res.status) {
        setIsSuccess(true);
        // Auto-login newly registered admin
        await login({ username: formData.username, password: formData.password });
        setTimeout(() => {
          router.push('/admin');
        }, 1200);
      } else {
        setServerError(res.message || 'Registrasi admin gagal. Silakan periksa data Anda.');
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
            Pendaftaran Pengelola Coworking
          </h1>
          <p className="text-xs text-zinc-400">
            Daftarkan properti coworking Anda untuk mengelola ruang, reservasi, dan laporan pendapatan.
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
              <div className="w-14 h-14 rounded-full bg-[#c5a880]/15 border border-[#c5a880]/30 text-[#dfcbb5] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white">Pendaftaran Admin Berhasil!</h2>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                Properti coworking Anda telah terdaftar. Mengalihkan Anda secara otomatis ke konsol admin...
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
                <Input
                  label="Nama Coworking Space"
                  required
                  placeholder="The Hive Sanctuary Coworking"
                  value={formData.nama_coworking}
                  onChange={(e) => setFormData({ ...formData, nama_coworking: e.target.value })}
                  error={errors.nama_coworking}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Pemilik / Manajer"
                    required
                    placeholder="Drs. Hendra Wibisono"
                    value={formData.nama_pemilik}
                    onChange={(e) => setFormData({ ...formData, nama_pemilik: e.target.value })}
                    error={errors.nama_pemilik}
                    leftIcon={<UserCheck className="w-4 h-4" />}
                  />

                  <Input
                    label="Nomor Telepon Operasional"
                    required
                    type="tel"
                    placeholder="0811-3456-789"
                    value={formData.telp}
                    onChange={(e) => setFormData({ ...formData, telp: e.target.value })}
                    error={errors.telp}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
                  <Input
                    label="Username Admin"
                    required
                    placeholder="admin_thehive"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={errors.username}
                    leftIcon={<User className="w-4 h-4" />}
                  />

                  <Input
                    label="Password Admin"
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
                    variant="accent"
                    className="w-full mt-4"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Daftarkan Coworking Space
                  </Button>
                </motion.div>
              </form>

              <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
                Sudah memiliki akun pengelola?{' '}
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
