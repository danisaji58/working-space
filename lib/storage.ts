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
  SPACES: 'ssb_spaces_v1',
  DISCOUNTS: 'ssb_discounts_v1',
  MEMBERS: 'ssb_members_v1',
  RESERVATIONS: 'ssb_reservations_v1',
  ADMIN_PROFILE: 'ssb_admin_profile_v1',
  MONTHLY_REPORT: 'ssb_monthly_report_v1',
  INCOME_REPORT: 'ssb_income_report_v1',
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
}): Reservation {
  const reservations = getLocalReservations();
  const space = getLocalSpaceById(payload.id_space) || INITIAL_SPACES[0];

  let discountPercent = 0;
  if (payload.kode_promo) {
    const discount = checkLocalDiscount(payload.kode_promo);
    if (discount) {
      discountPercent = discount.persentase_diskon;
    }
  }

  const { finalPrice } = calculatePrice(
    space.harga_per_jam,
    payload.durasi_jam,
    discountPercent
  );

  const newId = Math.max(0, ...reservations.map((r) => r.id_reservasi ?? r.id ?? 0)) + 1;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newReservation: Reservation = {
    id_reservasi: newId,
    id: newId,
    id_member: payload.id_member || 101,
    nama_member: payload.nama_member || 'Ahmad Fauzi',
    id_space: space.id_space ?? space.id ?? 0,
    nama_space: space.nama_space,
    tipe_space: space.tipe,
    foto_space: space.foto,
    harga_per_jam: space.harga_per_jam,
    tanggal_reservasi: payload.tanggal_reservasi,
    jam_mulai: payload.jam_mulai,
    durasi_jam: Number(payload.durasi_jam),
    id_diskon: payload.id_diskon || null,
    kode_promo: payload.kode_promo || null,
    persentase_diskon: discountPercent,
    total_harga: finalPrice,
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
  const index = reservations.findIndex((r) => r.id_reservasi === id);
  if (index === -1) return null;

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const current = reservations[index];

  const updated: Reservation = {
    ...current,
    status,
    waktu_check_in: status === 'aktif' ? (current.waktu_check_in || nowStr) : current.waktu_check_in,
    waktu_check_out: status === 'selesai' ? nowStr : current.waktu_check_out,
  };

  reservations[index] = updated;
  setItem(KEYS.RESERVATIONS, reservations);
  return updated;
}

export function getLocalETicket(id: number): ETicketData | null {
  const reservation = getLocalReservationById(id);
  if (!reservation) return null;

  const adminProfile = getLocalAdminProfile();
  const space = getLocalSpaceById(reservation.id_space) || INITIAL_SPACES[0];
  const members = getLocalMembers();
  const member = members.find((m) => (m.id_member || m.id) === reservation.id_member) || {
    nama_member: reservation.nama_member || 'Pengunjung',
    instansi: 'SMK Telkom Malang',
    telp: '081234567890',
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
export function getLocalMonthlyReport(): MonthlyReport {
  const reservations = getLocalReservations();
  const total = reservations.length;
  const selesai = reservations.filter((r) => r.status === 'selesai').length;
  const batal = reservations.filter((r) => r.status === 'dibatalkan').length;
  const totalPendapatan = reservations
    .filter((r) => r.status !== 'dibatalkan')
    .reduce((acc, curr) => acc + (curr.total_harga || 0), 0);

  const breakdown: Record<ReservationStatus, number> = {
    belum_dikonfirm: reservations.filter((r) => r.status === 'belum_dikonfirm').length,
    disetujui: reservations.filter((r) => r.status === 'disetujui').length,
    aktif: reservations.filter((r) => r.status === 'aktif').length,
    selesai,
    dibatalkan: batal,
  };

  return {
    bulan: 'September',
    tahun: 2026,
    total_reservasi: total,
    total_pendapatan: totalPendapatan,
    reservasi_selesai: selesai,
    reservasi_batal: batal,
    breakdown_status: breakdown,
  };
}

export function getLocalIncomeReport(): IncomeReport {
  const reservations = getLocalReservations();
  const spaces = getLocalSpaces();

  const deskReservations = reservations.filter((r) => {
    const s = spaces.find((sp) => sp.id_space === r.id_space);
    return s?.tipe === 'desk' && r.status !== 'dibatalkan';
  });
  const meetingReservations = reservations.filter((r) => {
    const s = spaces.find((sp) => sp.id_space === r.id_space);
    return s?.tipe === 'meeting_room' && r.status !== 'dibatalkan';
  });
  const officeReservations = reservations.filter((r) => {
    const s = spaces.find((sp) => sp.id_space === r.id_space);
    return s?.tipe === 'private_office' && r.status !== 'dibatalkan';
  });

  const deskIncome = deskReservations.reduce((acc, r) => acc + (r.total_harga || 0), 0);
  const meetingIncome = meetingReservations.reduce((acc, r) => acc + (r.total_harga || 0), 0);
  const officeIncome = officeReservations.reduce((acc, r) => acc + (r.total_harga || 0), 0);
  const totalIncome = deskIncome + meetingIncome + officeIncome || 14850000;

  return {
    total_pendapatan: totalIncome,
    distribusi_tipe: [
      {
        tipe: 'desk',
        label: 'Personal Desk',
        total_reservasi: deskReservations.length,
        total_pendapatan: deskIncome,
        persentase: Math.round((deskIncome / totalIncome) * 100) || 26,
      },
      {
        tipe: 'meeting_room',
        label: 'Meeting Room',
        total_reservasi: meetingReservations.length,
        total_pendapatan: meetingIncome,
        persentase: Math.round((meetingIncome / totalIncome) * 100) || 36,
      },
      {
        tipe: 'private_office',
        label: 'Private Office',
        total_reservasi: officeReservations.length,
        total_pendapatan: officeIncome,
        persentase: Math.round((officeIncome / totalIncome) * 100) || 38,
      },
    ],
    tren_bulanan: INITIAL_INCOME_REPORT.tren_bulanan,
  };
}
