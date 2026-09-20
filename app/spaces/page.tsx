'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Users, Check, ArrowRight, AlertCircle, Building, Sparkles } from 'lucide-react';
import { getSpaces } from '@/lib/api/spaces';
import { Space } from '@/types/api';
import { formatIDR, getSpaceTypeLabel, resolveSpaceImage } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingSkeleton } from '@/components/ui/EmptyState';
import { PublicNav } from '@/components/layout/public-nav';
import { MemberNav } from '@/components/layout/member-nav';
import { useAuth } from '@/context/auth-context';

const TYPE_FILTERS = [
  { key: 'all', label: 'Semua Ruang' },
  { key: 'desk', label: 'Personal Desk' },
  { key: 'meeting_room', label: 'Meeting Room' },
  { key: 'private_office', label: 'Private Office' },
];

export default function PublicSpacesCatalogPage() {
  const { isAuthenticated, role } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSpaces() {
      setIsLoading(true);
      try {
        const res = await getSpaces({
          tipe: selectedType === 'all' ? undefined : (selectedType as any),
          search: searchQuery.trim() || undefined,
        });
        if (res.status && Array.isArray(res.data)) {
          setSpaces(res.data);
          setApiError(null);
        } else {
          setApiError(res.message || 'Gagal memuat daftar ruang dari server.');
        }
      } catch (err) {
        setApiError('Gagal terhubung ke server API.');
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadSpaces();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedType, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col selection:bg-[#c5a880]/30 selection:text-[#dfcbb5]">
      {/* Adaptive Navigation */}
      {isAuthenticated ? <MemberNav /> : <PublicNav />}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Pilihan Workstation, Meeting & Private Atelier
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Jelajahi seluruh pilihan ruang kerja dengan fasilitas internet gigabit, kursi ergonomis, dan privasi penuh. Anda dapat melihat detail ruang dan ketersediaan slot sebelum melakukan reservasi.
          </p>
        </div>

        {apiError && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          {/* Type pill filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {TYPE_FILTERS.map((filter) => {
              const isSelected = selectedType === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setSelectedType(filter.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Search input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama ruang, fasilitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Grid of Spaces */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton rows={4} />
            <LoadingSkeleton rows={4} />
            <LoadingSkeleton rows={4} />
          </div>
        ) : spaces.length === 0 ? (
          <EmptyState
            title="Tidak ada ruang kerja yang cocok"
            description="Coba ubah kata kunci pencarian atau pilih kategori ruang yang lain."
            actionLabel="Tampilkan Semua Ruang"
            onAction={() => {
              setSelectedType('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const spaceId = space.id_space ?? space.id ?? 1;
              const isAvailable = space.available !== false && space.tersedia !== false;

              return (
                <div
                  key={spaceId}
                  className="card-luxury rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo showcase */}
                    <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                      <Image
                        src={resolveSpaceImage(space)}
                        alt={space.nama_space}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="accent" size="sm">
                          {getSpaceTypeLabel(space.tipe)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant={isAvailable ? 'success' : 'danger'} size="sm">
                          {isAvailable ? 'Tersedia' : 'Penuh'}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-[#dfcbb5] transition-colors">
                          {space.nama_space}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                          <Users className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Kapasitas {space.kapasitas} Orang</span>
                          {space.owner?.nama_coworking && (
                            <span>• {space.owner.nama_coworking}</span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {space.deskripsi}
                      </p>

                      {/* Amenities pills */}
                      {space.fasilitas && space.fasilitas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {space.fasilitas.slice(0, 3).map((f, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-[10px] text-zinc-300 flex items-center gap-1"
                            >
                              <Check className="w-2.5 h-2.5 text-[#c5a880]" />
                              <span>{f}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="p-5 pt-3 flex items-center justify-between border-t border-zinc-800/60 mt-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-mono">Tarif Sewa</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-white font-mono">
                          {formatIDR(space.harga_per_jam)}
                        </span>
                        <span className="text-[10px] text-zinc-400">/jam</span>
                      </div>
                    </div>

                    <Link href={`/spaces/${spaceId}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Detail & Pesan
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 mt-16 text-center text-xs text-zinc-500">
        <p>© 2026 Smart Space Coworking. Semua hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
