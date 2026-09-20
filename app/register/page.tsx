'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Shield, ArrowRight, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
} from '@/components/ui/motion-variants';

export default function RegisterHubPage() {
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
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.07),transparent_70%)] pointer-events-none"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl space-y-8 relative z-10 text-center"
      >
        {/* Navigation back to landing */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#c5a880]" />
            <span>Kembali ke Beranda</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={fadeInUp} className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-bold font-mono text-sm shadow"
            >
              SS
            </motion.div>
            <span className="text-sm font-semibold tracking-tight text-white group-hover:text-[#dfcbb5] transition-colors">
              SMART SPACE
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Pilih Jenis Akun Pendaftaran
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Daftarkan diri Anda sebagai pengunjung untuk reservasi ruang kerja atau sebagai pengelola ruang coworking.
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Member Card */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="card-luxury p-7 rounded-2xl flex flex-col justify-between group transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/70 border border-zinc-800 hover:border-zinc-500"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-white group-hover:bg-[#c5a880] group-hover:text-zinc-950 transition-colors">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#dfcbb5] transition-colors">Member / Pengunjung</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Untuk pelajar, freelancer, remote worker, dan tim yang ingin memesan ruang kerja & workstation.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Jelajah & booking workstation fleksibel</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Klaim kode promo & potongan harga</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unduh E-Ticket digital dengan QR Code</span>
                </li>
              </ul>
            </div>

            <Link href="/register/member" className="mt-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Daftar sebagai Member
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Admin Space Card */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="card-luxury p-7 rounded-2xl flex flex-col justify-between group transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#c5a880]/10 border border-zinc-800 hover:border-[#c5a880]/50"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-[#c5a880] group-hover:bg-[#c5a880] group-hover:text-zinc-950 transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#dfcbb5] transition-colors">Admin Pengelola Space</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Untuk pemilik fasilitas dan manajer operasional coworking space & workstation.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Kelola ruang, tarif, dan ketersediaan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Verifikasi reservasi, check-in, dan check-out</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  <span>Laporan analitik finansial & distribusi tipe</span>
                </li>
              </ul>
            </div>

            <Link href="/register/admin" className="mt-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="secondary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Daftar Pengelola Space
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Existing account link */}
        <motion.p variants={fadeInUp} className="text-xs text-zinc-400">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-white hover:text-[#c5a880] font-medium underline underline-offset-4">
            Masuk sekarang
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
