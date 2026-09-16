'use client';

import React from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
        <footer className="border-t border-zinc-900 bg-zinc-950 py-5 text-center text-xs text-zinc-400 font-mono">
          Smart Space Booking • Admin Management Console • UKK SMK Telkom FE
        </footer>
      </div>
    </div>
  );
}
