import {
  Space,
  Discount,
  Reservation,
  Member,
  AdminProfile,
  MonthlyReport,
  IncomeReport,
  ReservationStatus,
  ETicketData,
} from '@/types/api';
import {
  INITIAL_SPACES,
  INITIAL_DISCOUNTS,
  INITIAL_MEMBERS,
  INITIAL_RESERVATIONS,
  INITIAL_ADMIN_PROFILE,
  INITIAL_INCOME_REPORT,
} from './mock-data';
import { calculatePrice, calculateEndTime } from './utils';

const KEYS = {
  SPACES: 'ssb_spaces_v2',
  DISCOUNTS: 'ssb_discounts_v2',
  MEMBERS: 'ssb_members_v2',
  RESERVATIONS: 'ssb_reservations_v2',
  ADMIN_PROFILE: 'ssb_admin_profile_v2',
  MONTHLY_REPORT: 'ssb_monthly_report_v2',
  INCOME_REPORT: 'ssb_income_report_v2',
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write to localStorage for key ${key}`, e);
  }
}

// SPACES
export function getLocalSpaces(): Space[] {
  return getItem<Space[]>(KEYS.SPACES, INITIAL_SPACES);
}

export function getLocalSpaceById(id: number): Space | undefined {
  const spaces = getLocalSpaces();
  return spaces.find((s) => s.id_space === id);
}

export function saveLocalSpace(spaceData: Partial<Space>): Space {
  const spaces = getLocalSpaces();
  if (spaceData.id_space) {
    const index = spaces.findIndex((s) => s.id_space === spaceData.id_space);
    if (index !== -1) {
      spaces[index] = { ...spaces[index], ...spaceData } as Space;
      setItem(KEYS.SPACES, spaces);
      return spaces[index];
    }
  }

  const newId = Math.max(0, ...spaces.map((s) => s.id_space ?? s.id ?? 0)) + 1;
  const newSpace: Space = {
    id_space: newId,
    id: newId,
    nama_space: spaceData.nama_space || 'Ruang Baru',
    harga_per_jam: Number(spaceData.harga_per_jam) || 25000,
    tipe: spaceData.tipe || 'desk',
    kapasitas: Number(spaceData.kapasitas) || 1,
    deskripsi: spaceData.deskripsi || '',
    foto: spaceData.foto || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    tersedia: true,
    fasilitas: spaceData.fasilitas || ['High-Speed WiFi', 'Power Hub', 'AC'],
  };
  spaces.unshift(newSpace);
  setItem(KEYS.SPACES, spaces);
  return newSpace;
}

export function deleteLocalSpace(id: number): boolean {
  const spaces = getLocalSpaces();
  const filtered = spaces.filter((s) => s.id_space !== id);
  setItem(KEYS.SPACES, filtered);
  return true;
}

// DISCOUNTS
export function getLocalDiscounts(): Discount[] {
  return getItem<Discount[]>(KEYS.DISCOUNTS, INITIAL_DISCOUNTS);
}

export function checkLocalDiscount(code: string): Discount | null {
  const discounts = getLocalDiscounts();
  const trimmed = code.trim().toUpperCase();
  const found = discounts.find(
    (d) => d.nama_diskon.toUpperCase() === trimmed && (d.is_active !== false)
  );
  return found || null;
}

export function saveLocalDiscount(discountData: Partial<Discount>): Discount {
  const discounts = getLocalDiscounts();
  if (discountData.id_diskon) {
    const index = discounts.findIndex((d) => d.id_diskon === discountData.id_diskon);
    if (index !== -1) {
      discounts[index] = { ...discounts[index], ...discountData } as Discount;
      setItem(KEYS.DISCOUNTS, discounts);
      return discounts[index];
    }
  }

  const newId = Math.max(0, ...discounts.map((d) => d.id_diskon ?? d.id ?? 0)) + 1;
  const newDiscount: Discount = {
    id_diskon: newId,
    id: newId,
    nama_diskon: (discountData.nama_diskon || 'PROMO').toUpperCase(),
    persentase_diskon: Number(discountData.persentase_diskon) || 10,
    tanggal_awal: discountData.tanggal_awal || new Date().toISOString().split('T')[0],
    tanggal_akhir: discountData.tanggal_akhir || '2026-12-31',
    is_active: true,
  };
  discounts.unshift(newDiscount);
  setItem(KEYS.DISCOUNTS, discounts);
  return newDiscount;
}

export function deleteLocalDiscount(id: number): boolean {
  const discounts = getLocalDiscounts();
  const filtered = discounts.filter((d) => d.id_diskon !== id);
  setItem(KEYS.DISCOUNTS, filtered);
  return true;
}

// MEMBERS
export function getLocalMembers(): Member[] {
  return getItem<Member[]>(KEYS.MEMBERS, INITIAL_MEMBERS);
}

export function saveLocalMember(memberData: Partial<Member>): Member {
  const members = getLocalMembers();
  if (memberData.id_member || memberData.id) {
    const targetId = memberData.id_member || memberData.id;
    const index = members.findIndex((m) => (m.id_member || m.id) === targetId);
    if (index !== -1) {
      members[index] = { ...members[index], ...memberData } as Member;
      setItem(KEYS.MEMBERS, members);
      return members[index];
    }
  }

  const newId = Math.max(0, ...members.map((m) => m.id_member || m.id || 0)) + 1;
  const newMember: Member = {
    id_member: newId,
    id: newId,
    username: memberData.username || `member_${newId}`,
    nama_member: memberData.nama_member || 'Pengunjung Baru',
    instansi: memberData.instansi || 'Umum',
    alamat: memberData.alamat || '',
    telp: memberData.telp || '08123456789',
    foto: memberData.foto || '',
    created_at: new Date().toISOString().split('T')[0],
  };
  members.unshift(newMember);
  setItem(KEYS.MEMBERS, members);
  return newMember;
}

export function deleteLocalMember(id: number): boolean {
  const members = getLocalMembers();
  const filtered = members.filter((m) => (m.id_member || m.id) !== id);
  setItem(KEYS.MEMBERS, filtered);
  return true;
}

// RESERVATIONS
export function getLocalReservations(): Reservation[] {
  return getItem<Reservation[]>(KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
}

export function getLocalReservationById(id: number): Reservation | undefined {
  const reservations = getLocalReservations();
  return reservations.find((r) => r.id_reservasi === id);
}

export function createLocalReservation(payload: {
  id_space: number;
  tanggal_reservasi: string;
  jam_mulai: string;
  durasi_jam: number;
  id_diskon?: number | null;
  kode_promo?: string | null;
  id_member?: number;
  nama_member?: string;
  nama_space?: string;
  tipe_space?: 'desk' | 'meeting_room' | 'private_office' | string;
  foto_space?: string;
  harga_per_jam?: number;
}): Reservation {
  const reservations = getLocalReservations();
  const space = getLocalSpaceById(payload.id_space) || {
    id_space: payload.id_space,
    id: payload.id_space,
    nama_space: payload.nama_space || 'Ruang Kerja',
    tipe: (payload.tipe_space as 'desk' | 'meeting_room' | 'private_office') || 'desk',
    foto: payload.foto_space || '',
    harga_per_jam: payload.harga_per_jam || 25000,
    kapasitas: 1,
    deskripsi: '',
    tersedia: true,
    fasilitas: [],
  };

  let discountPercent = 0;
  if (payload.kode_promo) {
    const discount = checkLocalDiscount(payload.kode_promo);
    if (discount) {
      discountPercent = discount.persentase_diskon;
    }
  }

  const hourlyRate = payload.harga_per_jam || space.harga_per_jam || 25000;
  const { finalPrice } = calculatePrice(
    hourlyRate,
    payload.durasi_jam,
    discountPercent
  );

  const newId = Math.max(0, ...reservations.map((r) => r.id_reservasi ?? r.id ?? 0)) + 1;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newReservation: Reservation = {
    id_reservasi: newId,
    id: newId,
    id_member: payload.id_member || 101,
    nama_member: payload.nama_member || 'Pengunjung',
    id_space: space.id_space ?? space.id ?? payload.id_space,
    nama_space: payload.nama_space || space.nama_space,
    tipe_space: payload.tipe_space || space.tipe,
    foto_space: payload.foto_space || space.foto,
    harga_per_jam: hourlyRate,
    tanggal_reservasi: payload.tanggal_reservasi,
    jam_mulai: payload.jam_mulai,
    durasi_jam: Number(payload.durasi_jam),
    id_diskon: payload.id_diskon || null,
    kode_promo: payload.kode_promo || null,
    persentase_diskon: discountPercent,
    total_harga: finalPrice,
    total_bayar: finalPrice,
    status: 'belum_dikonfirm',
    waktu_check_in: null,
    waktu_check_out: null,
    created_at: nowStr,
  };

  reservations.unshift(newReservation);
  setItem(KEYS.RESERVATIONS, reservations);
  return newReservation;
}

export function updateLocalReservationStatus(
  id: number,
  status: ReservationStatus
): Reservation | null {
  const reservations = getLocalReservations();
  const index = reservations.findIndex((r) => (r.id_reservasi ?? r.id) === id);
  if (index === -1) return null;

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const current = reservations[index];

  const updated: Reservation = {
    ...current,
    status,
    waktu_check_in: status === 'aktif' ? (current.waktu_check_in || nowStr) : current.waktu_check_in,
    waktu_check_out: status === 'selesai' ? (current.waktu_check_out || nowStr) : current.waktu_check_out,
  };

  reservations[index] = updated;
  setItem(KEYS.RESERVATIONS, reservations);
  return updated;
}

export function getLocalETicket(id: number): ETicketData | null {
  const reservation = getLocalReservationById(id);
  if (!reservation) return null;

  const adminProfile = getLocalAdminProfile();
  const space = getLocalSpaceById(reservation.id_space) || {
    id_space: reservation.id_space,
    id: reservation.id_space,
    nama_space: reservation.nama_space || 'Ruang Kerja',
    tipe: reservation.tipe_space || 'desk',
    foto: reservation.foto_space || '',
    harga_per_jam: reservation.harga_per_jam || 25000,
    kapasitas: 1,
    deskripsi: '',
    tersedia: true,
    fasilitas: [],
  };
  const members = getLocalMembers();
  const member = members.find((m) => (m.id_member || m.id) === reservation.id_member) || {
    nama_member: reservation.nama_member || 'Pengunjung',
    instansi: 'Umum',
    telp: '-',
    username: 'member',
  };

  const hargaAwal = space.harga_per_jam * reservation.durasi_jam;
  const potongan = hargaAwal - reservation.total_harga;
  const jamSelesai = calculateEndTime(reservation.jam_mulai, reservation.durasi_jam);

  const qrPayload = JSON.stringify({
    kode_booking: `BK-${reservation.id_reservasi}`,
    id_reservasi: reservation.id_reservasi,
    member: member.nama_member,
    space: space.nama_space,
    tanggal: reservation.tanggal_reservasi,
    jam: `${reservation.jam_mulai} - ${jamSelesai}`,
    status: reservation.status,
  });

  return {
    nomor_tiket: `TKT-${new Date(reservation.tanggal_reservasi).getFullYear()}-${String(reservation.id_reservasi).padStart(5, '0')}`,
    kode_booking: `SSB-${String(reservation.id_reservasi).padStart(6, '0')}`,
    coworking: {
      nama: adminProfile.nama_coworking,
      alamat: adminProfile.alamat || 'Malang, Jawa Timur',
      telp: adminProfile.telp,
    },
    member: {
      nama: member.nama_member,
      instansi: member.instansi,
      telp: member.telp,
      username: member.username,
    },
    space: {
      id: space.id_space ?? space.id ?? 0,
      nama: space.nama_space,
      tipe: space.tipe,
      kapasitas: space.kapasitas,
      harga_per_jam: space.harga_per_jam,
    },
    jadwal: {
      tanggal: reservation.tanggal_reservasi,
      jam_mulai: reservation.jam_mulai,
      durasi_jam: reservation.durasi_jam,
      jam_selesai: jamSelesai,
    },
    pembayaran: {
      harga_awal: hargaAwal,
      potongan: Math.max(0, potongan),
      total_bayar: reservation.total_harga,
      kode_promo: reservation.kode_promo || undefined,
      status_reservasi: reservation.status,
    },
    qr_payload: qrPayload,
  };
}

// ADMIN PROFILE
export function getLocalAdminProfile(): AdminProfile {
  return getItem<AdminProfile>(KEYS.ADMIN_PROFILE, INITIAL_ADMIN_PROFILE);
}

export function saveLocalAdminProfile(profileData: Partial<AdminProfile>): AdminProfile {
  const current = getLocalAdminProfile();
  const updated = { ...current, ...profileData };
  setItem(KEYS.ADMIN_PROFILE, updated);
  return updated;
}

// REPORTS
export function getLocalMonthlyReport(filters?: {
  month?: string | number;
  year?: string | number;
}): MonthlyReport {
  let reservations = getLocalReservations();
  const spaces = getLocalSpaces();

  if (filters?.month && filters.month !== 'all') {
    reservations = reservations.filter((r) => {
      const m = new Date(r.tanggal_reservasi).getMonth() + 1;
      return String(m) === String(filters.month) || String(m).padStart(2, '0') === String(filters.month);
    });
  }
  if (filters?.year && filters.year !== 'all') {
    reservations = reservations.filter((r) => {
      const y = new Date(r.tanggal_reservasi).getFullYear();
      return String(y) === String(filters.year);
    });
  }

  const validReservations = reservations.filter((r) => r.status !== 'dibatalkan');
  const total = reservations.length;
  const selesai = reservations.filter((r) => r.status === 'selesai').length;
  const batal = reservations.filter((r) => r.status === 'dibatalkan').length;

  const realisasiBersih = validReservations.reduce((acc, curr) => acc + (curr.total_harga || 0), 0);
  const totalJam = validReservations.reduce((acc, curr) => acc + (Number(curr.durasi_jam) || 0), 0);

  // Gross estimate before discounts
  const estimasiKotor = validReservations.reduce((acc, curr) => {
    const sp = spaces.find((s) => s.id_space === curr.id_space);
    const hourly = sp?.harga_per_jam || curr.harga_per_jam || 0;
    return acc + hourly * (Number(curr.durasi_jam) || 1);
  }, 0);
  const totalPotongan = Math.max(0, estimasiKotor - realisasiBersih);

  const breakdown: Record<ReservationStatus, number> = {
    belum_dikonfirm: reservations.filter((r) => r.status === 'belum_dikonfirm').length,
    disetujui: reservations.filter((r) => r.status === 'disetujui').length,
    aktif: reservations.filter((r) => r.status === 'aktif').length,
    selesai,
    dibatalkan: batal,
  };

  const types: { tipe: 'desk' | 'meeting_room' | 'private_office'; label: string }[] = [
    { tipe: 'desk', label: 'Personal Desk' },
    { tipe: 'meeting_room', label: 'Meeting Room' },
    { tipe: 'private_office', label: 'Private Office' },
  ];

  const rincianSpace = types.map((t) => {
    const filtered = validReservations.filter((r) => {
      const sp = spaces.find((s) => s.id_space === r.id_space);
      return (sp?.tipe === t.tipe || r.tipe_space === t.tipe);
    });
    return {
      tipe: t.tipe,
      label: t.label,
      total_booking: filtered.length,
      total_jam: filtered.reduce((sum, r) => sum + (Number(r.durasi_jam) || 0), 0),
      total_pendapatan: filtered.reduce((sum, r) => sum + (Number(r.total_harga) || 0), 0),
    };
  });

  return {
    bulan: filters?.month ? String(filters.month) : 'Semua',
    tahun: filters?.year ? Number(filters.year) : new Date().getFullYear(),
    total_reservasi: total,
    total_transaksi: total,
    total_pendapatan: realisasiBersih,
    estimasi_pendapatan_kotor: estimasiKotor,
    total_potongan_diskon: totalPotongan,
    realisasi_pendapatan_bersih: realisasiBersih,
    total_jam_terpakai: totalJam,
    reservasi_selesai: selesai,
    reservasi_batal: batal,
    breakdown_status: breakdown,
    rincian_per_tipe_space: rincianSpace,
  };
}

export function getLocalIncomeReport(filters?: {
  month?: string | number;
  year?: string | number;
}): IncomeReport {
  const report = getLocalMonthlyReport(filters);
  const total = report.realisasi_pendapatan_bersih || report.total_pendapatan || 0;

  const distribusi = (report.rincian_per_tipe_space || []).map((r) => ({
    tipe: r.tipe,
    label: r.label,
    total_reservasi: r.total_booking,
    total_pendapatan: r.total_pendapatan,
    persentase: total > 0 ? Math.round((r.total_pendapatan / total) * 100) : 0,
  }));

  return {
    total_pendapatan: total,
    realisasi_pendapatan_bersih: total,
    distribusi_tipe: distribusi,
    tren_bulanan: [],
  };
}
