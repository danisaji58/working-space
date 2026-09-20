'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { MemberNav } from '@/components/layout/member-nav';
import { PublicNav } from '@/components/layout/public-nav';
import { ForbiddenView } from '@/components/auth/ForbiddenView';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Smooth loading state to prevent flash of forbidden content
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700/80 animate-pulse flex items-center justify-center font-mono font-bold text-xs text-[#c5a880] shadow-lg">
            SS
          </div>
          <span className="text-xs font-mono text-zinc-500 animate-pulse">
            Memverifikasi status member...
          </span>
        </div>
      </div>
    );
  }

  const pathname = usePathname();
  const isPublicCatalog = pathname?.startsWith('/member/spaces');

  // If user is guest/unauthenticated, allow /member/spaces with PublicNav or block other member routes
  if (!isAuthenticated) {
    if (isPublicCatalog) {
      return (
        <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col">
          <PublicNav />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col">
        <PublicNav />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <ForbiddenView type="member" reason="unauthenticated" />
        </main>
      </div>
    );
  }

  // Authenticated Member experience
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col">
      <MemberNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
