import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Smart Space Booking — Reservasi Coworking Space & Workstation',
  description:
    'Aplikasi reservasi coworking space dan workstation profesional dengan sistem booking terintegrasi, kalkulasi diskon otomatis, dan e-ticket QR Code.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#0b0b0c] text-zinc-100 selection:bg-[#c5a880]/30 selection:text-[#dfcbb5]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
