'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Sliders, ExternalLink, Database } from 'lucide-react';
import { getApiBaseUrl, getMakerKey, isExplicitDemoMode, setExplicitDemoMode } from '@/lib/api/client';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';

export function ApiStatusBanner() {
  const { isAuthenticated, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [makerKey, setMakerKey] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setBaseUrl(getApiBaseUrl());
    setMakerKey(getMakerKey());
    setDemoMode(isExplicitDemoMode());
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (baseUrl) localStorage.setItem('custom_api_base_url', baseUrl);
      else localStorage.removeItem('custom_api_base_url');

      if (makerKey) localStorage.setItem('custom_maker_key', makerKey);
      else localStorage.removeItem('custom_maker_key');

      setExplicitDemoMode(demoMode);
      window.location.reload();
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (makerKey) {
        headers['x-maker-key'] = makerKey;
        headers['x-app-key'] = makerKey;
      }
      const res = await fetch(`${baseUrl}/api/spaces/types`, { headers });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setTestResult(`Koneksi resmi berhasil! Server merespons ${res.status} OK.`);
      } else {
        setTestResult(`Server merespons status ${res.status}: ${data?.message || res.statusText}`);
      }
    } catch (e: unknown) {
      const err = e as Error;
      setTestResult(`Gagal terhubung ke API server: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const hasKey = !!makerKey;

  return (
    <>
      <aside
        aria-label="Status API"
        className={`fixed bottom-3 right-3 z-40 flex items-center gap-2 border text-xs py-1.5 px-3 rounded-full backdrop-blur-md shadow-xl transition-all cursor-pointer ${
          demoMode
            ? 'bg-amber-950/90 border-amber-700 text-amber-200'
            : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700'
        }`}
        onClick={() => setIsOpen(true)}
      >
        {/* <span className="flex h-2 w-2 relative">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              demoMode
                ? 'bg-amber-400'
                : hasKey
                ? 'bg-emerald-400'
                : 'bg-sky-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              demoMode
                ? 'bg-amber-500'
                : hasKey
                ? 'bg-emerald-500'
                : 'bg-sky-500'
            }`}
          />
        </span> */}
        {/* <span className="font-mono text-[11px] hidden sm:inline">
          {demoMode
            ? 'Mode Simulasi Demo (Aktif)'
            : hasKey
            ? 'Official API (Maker Key Terpasang)'
            : 'Official API (learn.smktelkom-mlg.sch.id)'}
        </span> */}
        <span className="font-mono text-[11px] sm:hidden">
          {demoMode ? 'Demo Mode' : 'Official API'}
        </span>
        <Sliders className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
      </aside>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Konfigurasi API & Maker Key"
        description="Pengaturan endpoint API resmi SMK Telkom Malang dan status x-maker-key."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sumber Data Utama: Official Coworking API</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Endpoint aktif:{' '}
              <code className="text-zinc-200 font-mono">
                https://learn.smktelkom-mlg.sch.id/coworking/
              </code>
              . Semua transaksi dan katalog ruang dikonsumsi langsung dari server resmi.
            </p>
          </div>

          <Input
            label="Base API URL"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://learn.smktelkom-mlg.sch.id/coworking"
            helperText="Default: https://learn.smktelkom-mlg.sch.id/coworking/"
          />

          <Input
            label="Personal Maker Key (x-maker-key)"
            value={makerKey}
            onChange={(e) => setMakerKey(e.target.value)}
            placeholder="Kosongkan jika belum memiliki Maker Key..."
            helperText={
              hasKey
                ? 'Maker Key terkonfigurasi pada header x-maker-key.'
                : 'Maker Key belum diisi (dapat dikosongkan jika belum disediakan oleh penguji).'
            }
          />

          {/* Explicit Demo Simulation Mode Toggle */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="explicit_demo_mode"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="mt-0.5 rounded bg-zinc-900 border-zinc-700 text-[#c5a880] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="explicit_demo_mode" className="text-xs space-y-0.5 cursor-pointer">
              <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <span>Mode Simulasi Data Lokal (Development Only)</span>
                {demoMode && (
                  <span className="text-[10px] text-amber-400 font-mono">[Aktif]</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Gunakan hanya jika server sekolah sedang maintenance atau offline total. Secara default dinonaktifkan agar aplikasi mengonsumsi data resmi API.
              </p>
            </label>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs border ${
                testResult.includes('berhasil')
                  ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                  : 'bg-zinc-800/50 text-zinc-300 border-zinc-700/50'
              }`}
            >
              {testResult}
            </div>
          )}

          {/* Shortcut to 50 Endpoint API Explorer */}
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Konsol 50 Endpoint API & Multi-Tenancy</span>
              </span>
              <p className="text-[11px] text-zinc-400">
                Uji dan jalankan seluruh 50 endpoint UKK secara interaktif langsung dari Frontend.
              </p>
            </div>
            <Link
              href={isAuthenticated && role === 'admin_space' ? '/admin/api-hub' : '/login'}
              onClick={() => setIsOpen(false)}
            >
              <Button size="sm" variant="outline" className="text-xs shrink-0">
                Buka Konsol
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testConnection}
              isLoading={isTesting}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Uji Koneksi Server
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSave}>
                Simpan Konfigurasi
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
