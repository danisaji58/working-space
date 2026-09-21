import { Space, Discount, Reservation, Member, AdminProfile, MonthlyReport, IncomeReport } from '@/types/api';

export const INITIAL_SPACES: Space[] = [];

export const INITIAL_DISCOUNTS: Discount[] = [];

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_ADMIN_PROFILE: AdminProfile = {
  id_admin: 1,
  username: 'admin_coworking',
  nama_coworking: 'Coworking Space Sanctuary',
  nama_pemilik: 'Administrator',
  alamat: 'Jl. Danau Ranau No. 1, Sawojajar, Kota Malang, Jawa Timur',
  telp: '0341-712345 / 0812-3456-7890',
  deskripsi_fasilitas:
    'Fasilitas coworking modern terlengkap dengan konsep Luxury Monochrome. Dilengkapi internet optical fiber kecepatan tinggi, workstation ergonomis, meeting room, dan fasilitas pendukung untuk produktivitas kerja.',
};

export const INITIAL_MONTHLY_REPORT: MonthlyReport = {
  bulan: 'September',
  tahun: 2026,
  total_reservasi: 0,
  total_pendapatan: 0,
  reservasi_selesai: 0,
  reservasi_batal: 0,
  breakdown_status: {
    belum_dikonfirm: 0,
    disetujui: 0,
    aktif: 0,
    selesai: 0,
    dibatalkan: 0,
  },
};

export const INITIAL_INCOME_REPORT: IncomeReport = {
  total_pendapatan: 0,
  distribusi_tipe: [],
  tren_bulanan: [],
};

