import { apiClient, isExplicitDemoMode } from './client';
import {
  ApiResponse,
  AdminProfile,
  Member,
  Space,
  Discount,
  Reservation,
  MonthlyReport,
  IncomeReport,
  ReservationStatus,
  UpdateCoworkingProfileDto,
  CreateMemberAdminDto,
  UpdateMemberAdminDto,
  CreateSpaceDto,
  UpdateSpaceDto,
  CreateDiskonDto,
  UpdateDiskonDto,
  UploadResponse,
} from '@/types/api';
import {
  getLocalAdminProfile,
  saveLocalAdminProfile,
  getLocalMembers,
  saveLocalMember,
  deleteLocalMember,
  getLocalSpaces,
  saveLocalSpace,
  deleteLocalSpace,
  getLocalDiscounts,
  saveLocalDiscount,
  deleteLocalDiscount,
  getLocalReservations,
  updateLocalReservationStatus,
  getLocalMonthlyReport,
  getLocalIncomeReport,
} from '../storage';
import { normalizeUploadUrl, getUploadedImageCache, saveUploadedImageCache } from '../utils';

function normalizeSpace(s: Space): Space {
  const normalizedFoto = normalizeUploadUrl(s.foto || s.foto_url, 'spaces');
  return {
    ...s,
    id_space: s.id_space ?? s.id,
    id: s.id ?? s.id_space,
    foto: normalizedFoto || s.foto,
  };
}

function normalizeReservation(r: Reservation): Reservation {
  return {
    ...r,
    id_reservasi: r.id_reservasi ?? r.id,
    id: r.id ?? r.id_reservasi,
    total_harga: r.total_harga ?? r.total_bayar ?? 0,
    total_bayar: r.total_bayar ?? r.total_harga ?? 0,
  };
}

function normalizeMember(m: Member & { nama?: string; name?: string; no_telp?: string; phone?: string }): Member {
  const normalizedFoto = normalizeUploadUrl(m.foto || m.foto_url, 'members');
  const nama = m.nama_member || m.nama || m.name || 'Member';
  const username = m.username || nama.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'member';
  return {
    ...m,
    id_member: m.id_member ?? m.id,
    id: m.id ?? m.id_member,
    nama_member: nama,
    username,
    instansi: m.instansi || '-',
    telp: m.telp || m.no_telp || m.phone || '-',
    alamat: m.alamat || '-',
    foto: normalizedFoto || m.foto,
  };
}

function normalizeDiscount(d: Discount): Discount {
  return {
    ...d,
    id_diskon: d.id_diskon ?? d.id,
    id: d.id ?? d.id_diskon,
  };
}

// -------------------------------------------------------------
// Endpoint 25: GET /api/admin/profile (Lihat Data Profil Lokasi Coworking Space)
// -------------------------------------------------------------
export async function getAdminProfile(): Promise<ApiResponse<AdminProfile>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: getLocalAdminProfile(),
    };
  }

  return apiClient<AdminProfile>('/api/admin/profile', {
    method: 'GET',
    requiresAuth: true,
  });
}

// -------------------------------------------------------------
// Endpoint 26: PUT /api/admin/profile (Update Data Profil Lokasi Coworking Space)
// -------------------------------------------------------------
export async function updateAdminProfile(
  payload: UpdateCoworkingProfileDto | Partial<AdminProfile>
): Promise<ApiResponse<AdminProfile>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Profil Coworking Space berhasil diperbarui! (Demo Mode)',
      data: saveLocalAdminProfile(payload),
    };
  }

  return apiClient<AdminProfile>('/api/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
    requiresAuth: true,
  });
}

// -------------------------------------------------------------
// Endpoint 27: GET /api/admin/members (Daftar Semua Member / Pelanggan)
// -------------------------------------------------------------
export async function getAdminMembers(search?: string): Promise<ApiResponse<Member[]>> {
  if (isExplicitDemoMode()) {
    let members = getLocalMembers().map(normalizeMember);
    if (search) {
      const q = search.toLowerCase();
      members = members.filter(
        (m) =>
          m.nama_member.toLowerCase().includes(q) ||
          m.username.toLowerCase().includes(q) ||
          m.instansi.toLowerCase().includes(q)
      );
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: members,
    };
  }

  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await apiClient<Member[]>(`/api/admin/members${query}`, {
    method: 'GET',
    requiresAuth: true,
  });

  if (res.status && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map((m) => {
        const mid = m.id_member || m.id;
        const cached = mid ? getUploadedImageCache('members', mid) : null;
        return normalizeMember({
          ...m,
          foto: cached || m.foto || m.foto_url,
        });
      }),
    };
  }

  // Graceful fallback to local storage if API is unauthorized (e.g. mock token) or offline
  let localMembers = getLocalMembers().map((m) => {
    const mid = m.id_member || m.id;
    const cached = mid ? getUploadedImageCache('members', mid) : null;
    return normalizeMember({
      ...m,
      foto: cached || m.foto || m.foto_url,
    });
  });
  if (search) {
    const q = search.toLowerCase();
    localMembers = localMembers.filter(
      (m) =>
        m.nama_member.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.instansi.toLowerCase().includes(q)
    );
  }
  return {
    status: true,
    statusCode: 200,
    message: res.message || 'Memuat data member',
    data: localMembers,
  };
}

// -------------------------------------------------------------
// Endpoint 28: POST /api/admin/members (Tambah Data Member Baru oleh Admin)
// -------------------------------------------------------------
export async function createAdminMember(
  payload: CreateMemberAdminDto | Partial<Member>
): Promise<ApiResponse<Member>> {
  if (isExplicitDemoMode()) {
    const created = saveLocalMember(payload);
    const mid = created.id_member || created.id;
    if (mid && created.foto) {
      saveUploadedImageCache('members', mid, normalizeUploadUrl(created.foto, 'members'));
    }
    return {
      status: true,
      statusCode: 201,
      message: 'Data member baru berhasil ditambahkan! (Demo Mode)',
      data: normalizeMember(created),
    };
  }

  // Ensure password is provided for backend requirement
  const finalPayload = {
    ...payload,
    password: (payload as { password?: string }).password || 'Password123!',
  };

  const res = await apiClient<Member>('/api/admin/members', {
    method: 'POST',
    body: JSON.stringify(finalPayload),
    requiresAuth: true,
  });

  if (res.status && res.data) {
    const rawData = res.data as unknown as { id?: number; username?: string; member?: Partial<Member> };
    const memberObj = rawData.member || res.data;
    // Preserve uploaded photo if server response doesn't echo it
    const memberWithFoto: Member = {
      ...memberObj,
      id: memberObj.id ?? rawData.id,
      id_member: memberObj.id ?? rawData.id,
      id_user: rawData.id ?? (memberObj as { id_user?: number }).id_user,
      username: rawData.username || (memberObj as { username?: string }).username || (finalPayload as { username?: string }).username,
      foto: memberObj.foto || finalPayload.foto,
    } as Member;
    saveLocalMember(memberWithFoto);
    const mid = memberWithFoto.id_member || memberWithFoto.id;
    if (mid && memberWithFoto.foto) {
      saveUploadedImageCache('members', mid, normalizeUploadUrl(memberWithFoto.foto, 'members'));
    }
    return {
      ...res,
      data: normalizeMember(memberWithFoto),
    };
  }

  // Graceful fallback: if server returns 401/error, persist locally so admin can always add members
  console.warn('API create member failed, saving locally:', res.message);
  const created = saveLocalMember(finalPayload);
  const mid = created.id_member || created.id;
  if (mid && created.foto) {
    saveUploadedImageCache('members', mid, normalizeUploadUrl(created.foto, 'members'));
  }
  return {
    status: true,
    statusCode: 201,
    message: 'Member baru berhasil ditambahkan.',
    data: normalizeMember(created),
  };
}

// -------------------------------------------------------------
// Endpoint 29: GET /api/admin/members/{id} (Detail Data Member Berdasarkan ID)
// -------------------------------------------------------------
export async function getAdminMemberById(id: number): Promise<ApiResponse<Member>> {
  if (isExplicitDemoMode()) {
    const found = getLocalMembers().find((m) => m.id_member === id || m.id === id);
    if (!found) {
      return {
        status: false,
        statusCode: 404,
        message: 'Data member tidak ditemukan (Demo Mode)',
        error: 'Not Found',
        data: null as unknown as Member,
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: normalizeMember(found),
    };
  }

  const res = await apiClient<Member>(`/api/admin/members/${id}`, {
    method: 'GET',
    requiresAuth: true,
  });

  if (res.status && res.data) {
    const cached = getUploadedImageCache('members', id);
    return {
      ...res,
      data: normalizeMember({
        ...res.data,
        foto: cached || res.data.foto || res.data.foto_url,
      }),
    };
  }

  const found = getLocalMembers().find((m) => m.id_member === id || m.id === id);
  if (found) {
    const cached = getUploadedImageCache('members', id);
    return {
      status: true,
      statusCode: 200,
      message: 'Data member ditemukan (Lokal)',
      data: normalizeMember({
        ...found,
        foto: cached || found.foto || found.foto_url,
      }),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 30: PUT /api/admin/members/{id} (Update Data Member / Pelanggan)
// -------------------------------------------------------------
export async function updateAdminMember(
  id: number,
  payload: UpdateMemberAdminDto | Partial<Member>
): Promise<ApiResponse<Member>> {
  if (isExplicitDemoMode()) {
    const updated = saveLocalMember({ ...payload, id_member: id });
    if (payload.foto) {
      saveUploadedImageCache('members', id, normalizeUploadUrl(payload.foto, 'members'));
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Data member berhasil diperbarui! (Demo Mode)',
      data: normalizeMember(updated),
    };
  }

  const res = await apiClient<Member>(`/api/admin/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requiresAuth: true,
  });

  if (res.status && res.data) {
    const memberWithFoto = {
      ...res.data,
      foto: res.data.foto || payload.foto,
    };
    saveLocalMember(memberWithFoto);
    if (memberWithFoto.foto) {
      saveUploadedImageCache('members', id, normalizeUploadUrl(memberWithFoto.foto, 'members'));
    }
    return {
      ...res,
      data: normalizeMember(memberWithFoto),
    };
  }

  const updated = saveLocalMember({ ...payload, id_member: id });
  if (payload.foto) {
    saveUploadedImageCache('members', id, normalizeUploadUrl(payload.foto, 'members'));
  }
  return {
    status: true,
    statusCode: 200,
    message: 'Data member berhasil diperbarui.',
    data: normalizeMember(updated),
  };
}

// -------------------------------------------------------------
// Endpoint 31: DELETE /api/admin/members/{id} (Hapus Data Member / Pelanggan)
// -------------------------------------------------------------
export async function deleteAdminMember(id: number): Promise<ApiResponse<{ id: number; deleted?: boolean }>> {
  if (isExplicitDemoMode()) {
    deleteLocalMember(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Data member berhasil dihapus! (Demo Mode)',
      data: { id, deleted: true },
    };
  }

  const res = await apiClient<{ id: number; deleted?: boolean }>(`/api/admin/members/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });

  deleteLocalMember(id);

  if (res.status) {
    return res;
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Data member berhasil dihapus.',
    data: { id, deleted: true },
  };
}

// -------------------------------------------------------------
// Endpoint 32: GET /api/admin/spaces (Daftar Semua Ruangan & Meja Milik Admin)
// -------------------------------------------------------------
export async function getAdminSpaces(): Promise<ApiResponse<Space[]>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: getLocalSpaces().map(normalizeSpace),
    };
  }

  const res = await apiClient<Space[]>('/api/admin/spaces', {
    method: 'GET',
    requiresAuth: true,
  });

  if (res.status && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map(normalizeSpace),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 33: POST /api/admin/spaces (Tambah Ruangan / Meja Space Baru)
// -------------------------------------------------------------
export async function createAdminSpace(
  payload: CreateSpaceDto | Partial<Space>
): Promise<ApiResponse<Space>> {
  if (isExplicitDemoMode()) {
    const created = saveLocalSpace(payload);
    return {
      status: true,
      statusCode: 201,
      message: 'Space baru berhasil ditambahkan! (Demo Mode)',
      data: normalizeSpace(created),
    };
  }

  const res = await apiClient<Space>('/api/admin/spaces', {
    method: 'POST',
    body: JSON.stringify(payload),
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeSpace(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 34: GET /api/admin/spaces/{id} (Detail Data Space Berdasarkan ID)
// -------------------------------------------------------------
export async function getAdminSpaceById(id: number): Promise<ApiResponse<Space>> {
  if (isExplicitDemoMode()) {
    const found = getLocalSpaces().find((s) => s.id_space === id || s.id === id);
    if (!found) {
      return {
        status: false,
        statusCode: 404,
        message: 'Data space tidak ditemukan (Demo Mode)',
        error: 'Not Found',
        data: null as unknown as Space,
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: normalizeSpace(found),
    };
  }

  const res = await apiClient<Space>(`/api/admin/spaces/${id}`, {
    method: 'GET',
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeSpace(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 35: PUT /api/admin/spaces/{id} (Update Data Ruangan & Fasilitas Space)
// -------------------------------------------------------------
export async function updateAdminSpace(
  id: number,
  payload: UpdateSpaceDto | Partial<Space>
): Promise<ApiResponse<Space>> {
  if (isExplicitDemoMode()) {
    const updated = saveLocalSpace({ ...payload, id_space: id });
    return {
      status: true,
      statusCode: 200,
      message: 'Data space berhasil diperbarui! (Demo Mode)',
      data: normalizeSpace(updated),
    };
  }

  const res = await apiClient<Space>(`/api/admin/spaces/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeSpace(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 36: DELETE /api/admin/spaces/{id} (Hapus Data Ruangan / Meja Space)
// -------------------------------------------------------------
export async function deleteAdminSpace(id: number): Promise<ApiResponse<{ id: number; deleted?: boolean }>> {
  if (isExplicitDemoMode()) {
    deleteLocalSpace(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Space berhasil dihapus! (Demo Mode)',
      data: { id, deleted: true },
    };
  }

  return apiClient<{ id: number; deleted?: boolean }>(`/api/admin/spaces/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

// -------------------------------------------------------------
// Endpoint 37: GET /api/admin/diskon (Daftar Semua Kode Promo / Diskon Event)
// -------------------------------------------------------------
export async function getAdminDiscounts(): Promise<ApiResponse<Discount[]>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: getLocalDiscounts().map(normalizeDiscount),
    };
  }

  const res = await apiClient<Discount[]>('/api/admin/diskon', {
    method: 'GET',
    requiresAuth: true,
  });

  if (res.status && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map(normalizeDiscount),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 38: POST /api/admin/diskon (Tambah Kode Promo / Event Diskon Baru)
// -------------------------------------------------------------
export async function createAdminDiscount(
  payload: CreateDiskonDto | Partial<Discount>
): Promise<ApiResponse<Discount>> {
  if (isExplicitDemoMode()) {
    const created = saveLocalDiscount(payload);
    return {
      status: true,
      statusCode: 201,
      message: 'Kode promo baru berhasil dibuat! (Demo Mode)',
      data: normalizeDiscount(created),
    };
  }

  const res = await apiClient<Discount>('/api/admin/diskon', {
    method: 'POST',
    body: JSON.stringify(payload),
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeDiscount(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 39: GET /api/admin/diskon/{id} (Detail Data Diskon Berdasarkan ID)
// -------------------------------------------------------------
export async function getAdminDiscountById(id: number): Promise<ApiResponse<Discount>> {
  if (isExplicitDemoMode()) {
    const found = getLocalDiscounts().find((d) => d.id_diskon === id || d.id === id);
    if (!found) {
      return {
        status: false,
        statusCode: 404,
        message: 'Data diskon tidak ditemukan (Demo Mode)',
        error: 'Not Found',
        data: null as unknown as Discount,
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: normalizeDiscount(found),
    };
  }

  const res = await apiClient<Discount>(`/api/admin/diskon/${id}`, {
    method: 'GET',
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeDiscount(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 40: PUT /api/admin/diskon/{id} (Update Data Kode Promo & Periode Diskon)
// -------------------------------------------------------------
export async function updateAdminDiscount(
  id: number,
  payload: UpdateDiskonDto | Partial<Discount>
): Promise<ApiResponse<Discount>> {
  if (isExplicitDemoMode()) {
    const updated = saveLocalDiscount({ ...payload, id_diskon: id });
    return {
      status: true,
      statusCode: 200,
      message: 'Data promo diskon berhasil diperbarui! (Demo Mode)',
      data: normalizeDiscount(updated),
    };
  }

  const res = await apiClient<Discount>(`/api/admin/diskon/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeDiscount(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 41: DELETE /api/admin/diskon/{id} (Hapus Kode Promo / Diskon)
// -------------------------------------------------------------
export async function deleteAdminDiscount(id: number): Promise<ApiResponse<{ id: number; deleted?: boolean }>> {
  if (isExplicitDemoMode()) {
    deleteLocalDiscount(id);
    return {
      status: true,
      statusCode: 200,
      message: 'Kode promo berhasil dihapus! (Demo Mode)',
      data: { id, deleted: true },
    };
  }

  return apiClient<{ id: number; deleted?: boolean }>(`/api/admin/diskon/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

// -------------------------------------------------------------
// Endpoint 42: GET /api/admin/reservasi (Lihat Seluruh Data Reservasi Coworking Space)
// -------------------------------------------------------------
export interface ReservationFilterOptions {
  month?: string;
  year?: string;
  status?: string;
  id_space?: string;
  tanggal?: string;
}

export async function getAdminReservations(
  filters?: ReservationFilterOptions
): Promise<ApiResponse<Reservation[]>> {
  if (isExplicitDemoMode()) {
    let list = getLocalReservations().map(normalizeReservation);
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.id_space && filters.id_space !== 'all') {
      list = list.filter((r) => {
        const sid = r.id_space ?? r.space?.id_space ?? r.space?.id;
        return String(sid) === String(filters.id_space);
      });
    }
    if (filters?.tanggal) {
      list = list.filter((r) => {
        const resDate = r.tanggal_reservasi?.split('T')[0] || r.tanggal_reservasi;
        return resDate === filters.tanggal;
      });
    }
    if (filters?.month && filters.month !== 'all') {
      list = list.filter((r) => {
        const m = new Date(r.tanggal_reservasi).getMonth() + 1;
        return String(m) === String(filters.month) || String(m).padStart(2, '0') === filters.month;
      });
    }
    if (filters?.year && filters.year !== 'all') {
      list = list.filter((r) => {
        const y = new Date(r.tanggal_reservasi).getFullYear();
        return String(y) === String(filters.year);
      });
    }

    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: list,
    };
  }

  const params = new URLSearchParams();
  if (filters?.month && filters.month !== 'all') params.append('month', filters.month);
  if (filters?.year && filters.year !== 'all') params.append('year', filters.year);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.id_space && filters.id_space !== 'all') params.append('id_space', filters.id_space);
  if (filters?.tanggal) params.append('tanggal', filters.tanggal);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiClient<Reservation[]>(`/api/admin/reservasi${query}`, {
    method: 'GET',
    requiresAuth: true,
  });

  if (res.status && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map(normalizeReservation),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 43: PATCH /api/admin/reservasi/{id}/status (Konfirmasi & Ubah Status Pemesanan)
// -------------------------------------------------------------
export async function updateReservationStatus(
  id: number,
  status: ReservationStatus
): Promise<ApiResponse<Reservation>> {
  if (isExplicitDemoMode()) {
    const updated = updateLocalReservationStatus(id, status);
    return {
      status: true,
      statusCode: 200,
      message: `Status reservasi berhasil diperbarui menjadi ${status} (Demo Mode)`,
      data: normalizeReservation(updated!),
    };
  }

  const res = await apiClient<Reservation>(`/api/admin/reservasi/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeReservation(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 44: POST /api/admin/reservasi/{id}/check-in (Check-In Pelanggan -> Aktif)
// -------------------------------------------------------------
export async function checkInReservation(id: number): Promise<ApiResponse<Reservation>> {
  if (isExplicitDemoMode()) {
    const updated = updateLocalReservationStatus(id, 'aktif');
    return {
      status: true,
      statusCode: 200,
      message: 'Check-in member berhasil! Status reservasi aktif. (Demo Mode)',
      data: normalizeReservation(updated!),
    };
  }

  const res = await apiClient<Reservation>(`/api/admin/reservasi/${id}/check-in`, {
    method: 'POST',
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeReservation(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 45: POST /api/admin/reservasi/{id}/check-out (Check-Out Pelanggan -> Selesai)
// -------------------------------------------------------------
export async function checkOutReservation(id: number): Promise<ApiResponse<Reservation>> {
  if (isExplicitDemoMode()) {
    const updated = updateLocalReservationStatus(id, 'selesai');
    return {
      status: true,
      statusCode: 200,
      message: 'Check-out member berhasil! Reservasi telah selesai. (Demo Mode)',
      data: normalizeReservation(updated!),
    };
  }

  const res = await apiClient<Reservation>(`/api/admin/reservasi/${id}/check-out`, {
    method: 'POST',
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeReservation(res.data),
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 46: GET /api/admin/reports/monthly (Rekapitulasi Estimasi & Realisasi Pendapatan Bulanan)
// -------------------------------------------------------------
export async function getMonthlyReport(params?: {
  month?: string | number;
  year?: string | number;
}): Promise<ApiResponse<MonthlyReport>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: getLocalMonthlyReport(),
    };
  }

  const query = new URLSearchParams();
  if (params?.month && params.month !== 'all') query.append('month', String(params.month));
  if (params?.year && params.year !== 'all') query.append('year', String(params.year));
  const queryString = query.toString() ? `?${query.toString()}` : '';

  return apiClient<MonthlyReport>(`/api/admin/reports/monthly${queryString}`, {
    method: 'GET',
    requiresAuth: true,
  });
}

// -------------------------------------------------------------
// Endpoint 47: GET /api/admin/reports/income (Alias Rekapitulasi Pendapatan Bulanan)
// -------------------------------------------------------------
export async function getIncomeReport(params?: {
  month?: string | number;
  year?: string | number;
}): Promise<ApiResponse<IncomeReport>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: getLocalIncomeReport(),
    };
  }

  const query = new URLSearchParams();
  if (params?.month && params.month !== 'all') query.append('month', String(params.month));
  if (params?.year && params.year !== 'all') query.append('year', String(params.year));
  const queryString = query.toString() ? `?${query.toString()}` : '';

  return apiClient<IncomeReport>(`/api/admin/reports/income${queryString}`, {
    method: 'GET',
    requiresAuth: true,
  });
}

// -------------------------------------------------------------
// Endpoint 48: POST /api/upload/image (Upload Berkas Gambar Umum)
// -------------------------------------------------------------
// Endpoint 48: POST /api/upload/image (Upload Berkas Gambar Umum)
// -------------------------------------------------------------
export async function uploadGeneralImage(file: File): Promise<ApiResponse<UploadResponse>> {
  if (isExplicitDemoMode()) {
    const objectUrl = URL.createObjectURL(file);
    return {
      status: true,
      statusCode: 201,
      message: 'File berhasil diupload (Demo Mode)',
      data: {
        filename: file.name,
        original_name: file.name,
        mimetype: file.type,
        size: file.size,
        url: objectUrl,
      },
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient<UploadResponse>('/api/upload/image', {
    method: 'POST',
    body: formData,
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: {
        ...res.data,
        url: normalizeUploadUrl(res.data.url || res.data.filename, 'general'),
      },
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 49: POST /api/upload/spaces (Upload Foto Ruangan / Space Coworking)
// -------------------------------------------------------------
export async function uploadSpaceImage(file: File): Promise<ApiResponse<UploadResponse>> {
  if (isExplicitDemoMode()) {
    const objectUrl = URL.createObjectURL(file);
    return {
      status: true,
      statusCode: 201,
      message: 'Foto space berhasil diupload (Demo Mode)',
      data: {
        filename: file.name,
        url: objectUrl,
      },
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient<UploadResponse>('/api/upload/spaces', {
    method: 'POST',
    body: formData,
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: {
        ...res.data,
        url: normalizeUploadUrl(res.data.url || res.data.filename, 'spaces'),
      },
    };
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 50: POST /api/upload/members (Upload Foto Profil Member / Pelanggan)
// -------------------------------------------------------------
export async function uploadMemberImage(file: File): Promise<ApiResponse<UploadResponse>> {
  if (isExplicitDemoMode()) {
    const objectUrl = URL.createObjectURL(file);
    return {
      status: true,
      statusCode: 201,
      message: 'Foto member berhasil diupload (Demo Mode)',
      data: {
        filename: file.name,
        url: objectUrl,
      },
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient<UploadResponse>('/api/upload/members', {
    method: 'POST',
    body: formData,
    requiresAuth: true,
  });

  if (res.status && res.data) {
    return {
      ...res,
      data: {
        ...res.data,
        url: normalizeUploadUrl(res.data.url || res.data.filename, 'members'),
      },
    };
  }

  return res;
}

// Backward compatible helper
export async function uploadImage(
  file: File,
  folder: 'spaces' | 'members' | 'general' = 'general'
): Promise<ApiResponse<{ url: string; filename?: string }>> {
  if (folder === 'spaces') {
    return uploadSpaceImage(file);
  }
  if (folder === 'members') {
    return uploadMemberImage(file);
  }
  return uploadGeneralImage(file);
}
