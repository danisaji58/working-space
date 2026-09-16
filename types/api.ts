export interface ApiResponse<T = unknown> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
  error?: string;
}

export type UserRole = 'member' | 'admin_space';

export interface UserSession {
  token: string;
  role: UserRole;
  user: {
    id: number;
    username: string;
    nama: string;
    email?: string;
    instansi?: string;
    telp?: string;
    alamat?: string;
    foto?: string;
    nama_coworking?: string;
  };
}

// -------------------------------------------------------------
// Root & Health Check Models
// -------------------------------------------------------------
export interface RootApiInfo {
  name: string;
  version: string;
  status: string;
  swagger_docs?: string;
  description: string;
  documentation_links?: {
    swagger?: string;
    swagger_json?: string;
  };
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

// -------------------------------------------------------------
// Multi-Tenancy App Maker Models & DTOs
// -------------------------------------------------------------
export interface RegisterMakerDto {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginMakerDto {
  usernameOrEmail: string;
  password: string;
}

export interface MakerUser {
  id: number;
  name: string;
  username: string;
  email: string;
  app_key: string;
  created_at?: string;
  updated_at?: string;
  access_token?: string;
}

export interface MakerStats {
  total_members: number;
  total_spaces: number;
  total_diskon: number;
  total_reservasi: number;
  total_pendapatan: number;
}

export interface MakerListItem {
  id: number;
  name: string;
  username: string;
  email: string;
  app_key: string;
  created_at: string;
}

// -------------------------------------------------------------
// Member & Admin Models
// -------------------------------------------------------------
export interface Member {
  id?: number;
  id_member?: number;
  username: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string;
  foto_url?: string;
  created_at?: string;
}

export interface AdminProfile {
  id?: number;
  id_admin?: number;
  username?: string;
  nama_coworking: string;
  nama_pemilik: string;
  alamat?: string;
  telp: string;
  deskripsi_fasilitas?: string;
}

export interface UpdateCoworkingProfileDto {
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
  alamat?: string;
  deskripsi_fasilitas?: string;
}

export interface CreateMemberAdminDto {
  username: string;
  password: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string;
}

export interface UpdateMemberAdminDto {
  nama_member?: string;
  instansi?: string;
  alamat?: string;
  telp?: string;
  password?: string;
  foto?: string;
}

// -------------------------------------------------------------
// Space Models & DTOs
// -------------------------------------------------------------
export type SpaceType = 'desk' | 'meeting_room' | 'private_office' | string;

export interface SpaceTypeInfo {
  tipe: string;
  label: string;
  deskripsi: string;
}

export interface Space {
  id?: number;
  id_space?: number;
  nama_space: string;
  harga_per_jam: number;
  tipe: SpaceType;
  kapasitas: number;
  deskripsi: string;
  foto?: string;
  foto_url?: string;
  tersedia?: boolean | number;
  available?: boolean;
  active_bookings_count?: number;
  fasilitas?: string[];
  id_owner?: number;
  owner?: {
    id?: number;
    nama_coworking?: string;
    nama_pemilik?: string;
    telp?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateSpaceDto {
  nama_space: string;
  harga_per_jam: number;
  tipe: SpaceType;
  kapasitas: number;
  deskripsi: string;
  foto?: string;
}

export interface UpdateSpaceDto {
  nama_space?: string;
  harga_per_jam?: number;
  tipe?: SpaceType;
  kapasitas?: number;
  deskripsi?: string;
  foto?: string;
}

export interface SpaceAvailabilityQuery {
  id_space: number;
  tanggal: string; // YYYY-MM-DD
  jam_mulai: string; // HH:mm
  durasi_jam: number;
}

export interface SpaceAvailabilityResult {
  available: boolean;
  id_space: number;
  nama_space?: string;
  tanggal?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  durasi_jam?: number;
  harga_per_jam?: number;
  estimasi_total?: number;
}

// -------------------------------------------------------------
// Discount Models & DTOs
// -------------------------------------------------------------
export interface Discount {
  id?: number;
  id_diskon?: number;
  nama_diskon: string;
  persentase_diskon: number; // 1 to 100
  tanggal_awal: string; // ISO 8601 or YYYY-MM-DD
  tanggal_akhir: string; // ISO 8601 or YYYY-MM-DD
  maker_id?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CheckPromoDto {
  nama_diskon: string;
}

export interface CreateDiskonDto {
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: string;
  tanggal_akhir: string;
}

export interface UpdateDiskonDto {
  nama_diskon?: string;
  persentase_diskon?: number;
  tanggal_awal?: string;
  tanggal_akhir?: string;
}

// -------------------------------------------------------------
// Reservation Models & DTOs
// -------------------------------------------------------------
export type ReservationStatus =
  | 'belum_dikonfirm'
  | 'disetujui'
  | 'aktif'
  | 'selesai'
  | 'dibatalkan';

export interface CreateReservasiDto {
  id_space: number;
  tanggal_reservasi: string; // YYYY-MM-DD
  jam_mulai: string; // HH:mm
  durasi_jam: number;
  id_diskon?: number | null;
  kode_promo?: string | null;
}

export interface UpdateReservasiStatusDto {
  status: ReservationStatus;
}

export interface Reservation {
  id?: number;
  id_reservasi?: number;
  kode_booking?: string;
  id_member?: number;
  nama_member?: string;
  id_space: number;
  nama_space?: string;
  tipe_space?: string;
  foto_space?: string;
  harga_per_jam?: number;
  tanggal_reservasi: string; // YYYY-MM-DD
  jam_mulai: string; // HH:mm
  jam_selesai?: string; // HH:mm
  durasi_jam: number;
  id_diskon?: number | null;
  kode_promo?: string | null;
  persentase_diskon?: number;
  total_harga: number;
  total_harga_awal?: number;
  potongan_diskon?: number;
  total_bayar?: number;
  status: ReservationStatus;
  waktu_check_in?: string | null;
  check_in_time?: string | null;
  waktu_check_out?: string | null;
  check_out_time?: string | null;
  space?: Space;
  space_name?: string;
  member?: Member;
  created_at?: string;
  updated_at?: string;
}

export interface ReservationHistorySummary {
  month?: number;
  year?: number;
  total_reservasi: number;
  total_pengeluaran: number;
  items: Reservation[];
}

export interface ETicketData {
  e_ticket_number?: string;
  nomor_tiket?: string;
  kode_booking: string;
  status?: ReservationStatus;
  status_reservasi?: ReservationStatus;
  coworking_space?: {
    nama: string;
    telepon?: string;
    alamat?: string;
  };
  coworking?: {
    nama: string;
    alamat: string;
    telp: string;
  };
  member: {
    nama: string;
    nama_member?: string;
    instansi: string;
    telp: string;
    username?: string;
  };
  space: {
    id?: number;
    nama: string;
    tipe: string;
    kapasitas?: number;
    harga_per_jam: number;
  };
  jadwal: {
    tanggal: string;
    jam_mulai: string;
    durasi_jam?: number;
    durasi?: string;
    jam_selesai?: string;
  };
  rincian_pembayaran?: {
    tarif_kotor: number;
    diskon_promo?: string;
    potongan: number;
    total_dibayar: number;
  };
  pembayaran?: {
    harga_awal: number;
    potongan: number;
    total_bayar: number;
    kode_promo?: string;
    status_reservasi: ReservationStatus;
  };
  qr_code_payload?: string;
  qr_payload?: string;
}

// -------------------------------------------------------------
// Report Models
// -------------------------------------------------------------
export interface MonthlyReport {
  month?: number;
  year?: number;
  bulan?: string;
  tahun?: number;
  total_transaksi?: number;
  total_reservasi?: number;
  total_jam_terpakai?: number;
  estimasi_pendapatan_kotor?: number;
  total_potongan_diskon?: number;
  realisasi_pendapatan_bersih?: number;
  total_pendapatan?: number;
  reservasi_selesai?: number;
  reservasi_batal?: number;
  rincian_per_tipe_space?: {
    tipe: string;
    label: string;
    total_booking: number;
    total_jam: number;
    total_pendapatan: number;
  }[];
  breakdown_status?: Record<ReservationStatus, number>;
}

export interface IncomeReport {
  month?: number;
  year?: number;
  realisasi_pendapatan_bersih?: number;
  total_pendapatan?: number;
  distribusi_tipe?: {
    tipe: string;
    label: string;
    total_reservasi: number;
    total_pendapatan: number;
    persentase: number;
  }[];
  tren_bulanan?: {
    bulan: string;
    pendapatan: number;
    reservasi: number;
  }[];
}

// -------------------------------------------------------------
// Upload Response
// -------------------------------------------------------------
export interface UploadResponse {
  filename: string;
  url: string;
  original_name?: string;
  mimetype?: string;
  size?: number;
}

// -------------------------------------------------------------
// Endpoint Metadata for API Explorer & Documentation
// -------------------------------------------------------------
export interface ApiEndpointDefinition {
  no: number;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  role: string;
  description: string;
  category: string;
  hasAuth: boolean;
  sampleBody?: unknown;
  sampleParams?: string;
}
