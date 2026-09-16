'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username wajib diisi');
      return;
    }
    if (!password.trim()) {
      setError('Password wajib diisi');
      return;
    }

    setError(null);
    setIsLoading(true);

    const res = await login({ username, password });
    setIsLoading(false);

    if (res.success) {
      if (res.role === 'admin_space') {
        router.push('/admin');
      } else {
        router.push('/member');
      }
    } else {
      setError(res.message);
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#0b0b0c] relative overflow-hidden">
      {/* Background subtle architectural gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.06),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-zinc-950 font-bold font-mono text-sm shadow-md">
              SS
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              SMART SPACE
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs text-zinc-400">
            Masuk ke akun reservasi coworking space & workstation Anda
          </p>
        </div>

        {/* Form Card */}
        <div className="card-luxury p-6 sm:p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
                {error}
              </div>
            )}

            <Input
              label="Username"
              type="text"
              required
              placeholder="contoh: ahmad_fauzi atau admin_thehive"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk ke Sistem
            </Button>
          </form>

          {/* Registration links */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center space-y-2">
            <p className="text-xs text-zinc-400">
              Belum memiliki akun terdaftar?
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-medium">
              <Link
                href="/register/member"
                className="text-white hover:text-[#c5a880] transition-colors underline underline-offset-4"
              >
                Daftar Member
              </Link>
              <span className="text-zinc-600">•</span>
              <Link
                href="/register/admin"
                className="text-[#c5a880] hover:text-[#dfcbb5] transition-colors underline underline-offset-4"
              >
                Daftar Pengelola Space
              </Link>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Terhubung ke Official API Coworking SMK Telkom</span>
        </div>
      </div>
    </div>
  );
}
