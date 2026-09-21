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
  deleteLocalReservation,
  getDeletedReservationIds,
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
  const localMembers = getLocalMembers().map(normalizeMember);

  if (isExplicitDemoMode()) {
    let filtered = localMembers;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
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
      data: filtered,
    };
  }

  let merged: Member[] = [];
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiClient<Member[]>(`/api/admin/members${query}`, {
      method: 'GET',
      requiresAuth: true,
    });

    if (res.status && Array.isArray(res.data)) {
      const serverList = res.data.map((m) => {
        const mid = m.id_member || m.id;
        const cached = mid
          ? getUploadedImageCache('members', mid)
          : (m.username ? getUploadedImageCache('members', m.username) : null);
        return normalizeMember({
          ...m,
          foto: cached || m.foto || m.foto_url,
        });
      });

      const seenIds = new Set<number>();
      const seenUsernames = new Set<string>();

      serverList.forEach((m) => {
        const id = m.id_member || m.id;
        if (id) seenIds.add(Number(id));
        if (m.username) seenUsernames.add(m.username.toLowerCase());
      });

      // Filter local members that are not in server response (e.g. newly added locally / registered)
      const uniqueLocal = localMembers.filter((lm) => {
        const id = lm.id_member || lm.id;
        const username = lm.username?.toLowerCase();
        if (id && seenIds.has(Number(id))) return false;
        if (username && seenUsernames.has(username)) return false;
        return true;
      });

      merged = [...uniqueLocal, ...serverList];
    } else {
      merged = localMembers;
    }
  } catch {
    merged = localMembers;
  }

  // Ensure each member's photo is cached and normalized
  merged = merged.map((m) => {
    const mid = m.id_member || m.id;
    const cached = mid
      ? getUploadedImageCache('members', mid)
      : (m.username ? getUploadedImageCache('members', m.username) : null);
    return normalizeMember({
      ...m,
      foto: cached || m.foto || m.foto_url,
    });
  });

  if (search) {
    const q = search.toLowerCase();
    merged = merged.filter(
      (m) =>
        m.nama_member.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.instansi.toLowerCase().includes(q)
    );
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Berhasil memproses permintaan',
    data: merged,
  };
}

// -------------------------------------------------------------
// Endpoint 28: POST /api/admin/members (Tambah Data Member Baru oleh Admin)
// -------------------------------------------------------------
export async function createAdminMember(
  payload: CreateMemberAdminDto | Partial<Member>
): Promise<ApiResponse<Member>> {
  const finalPayload = {
    ...payload,
    password: (payload as { password?: string }).password || 'Password123!',
  };

  // 1. Immediately save to local storage to ensure persistent availability
  const createdLocal = saveLocalMember(finalPayload);
  const mid = createdLocal.id_member || createdLocal.id;
  if (finalPayload.foto) {
    if (mid) saveUploadedImageCache('members', mid, normalizeUploadUrl(finalPayload.foto, 'members'));
    if (createdLocal.username) saveUploadedImageCache('members', createdLocal.username, normalizeUploadUrl(finalPayload.foto, 'members'));
  }

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 201,
      message: 'Data member baru berhasil ditambahkan! (Demo Mode)',
      data: normalizeMember(createdLocal),
    };
  }

  try {
    const res = await apiClient<Member>('/api/admin/members', {
      method: 'POST',
      body: JSON.stringify(finalPayload),
      requiresAuth: true,
    });

    if (res.status && res.data) {
      const serverMid = res.data.id_member || res.data.id || mid;
      const memberWithFoto: Member = {
        ...res.data,
        id_member: serverMid,
        id: serverMid,
        foto: res.data.foto || finalPayload.foto,
      };
      saveLocalMember(memberWithFoto);
      if (finalPayload.foto) {
        if (serverMid) saveUploadedImageCache('members', serverMid, normalizeUploadUrl(finalPayload.foto, 'members'));
        if (memberWithFoto.username) saveUploadedImageCache('members', memberWithFoto.username, normalizeUploadUrl(finalPayload.foto, 'members'));
      }
      return {
        ...res,
        data: normalizeMember(memberWithFoto),
      };
    }
  } catch (err) {
    console.warn('API create member failed, persisting locally:', err);
  }

  return {
    status: true,
    statusCode: 201,
    message: 'Data member baru berhasil ditambahkan.',
    data: normalizeMember(createdLocal),
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
  const localSpaces = getLocalSpaces().map(normalizeSpace);
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: localSpaces,
    };
  }

  try {
    const res = await apiClient<Space[]>('/api/admin/spaces', {
      method: 'GET',
      requiresAuth: true,
    });

    if (res.status && Array.isArray(res.data)) {
      const serverList = res.data.map(normalizeSpace);
      const seenIds = new Set(serverList.map((s) => Number(s.id_space || s.id)));
      const uniqueLocal = localSpaces.filter((s) => !seenIds.has(Number(s.id_space || s.id)));
      return {
        ...res,
        data: [...uniqueLocal, ...serverList],
      };
    }
  } catch {
    // fallback
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Memuat data space',
    data: localSpaces,
  };
}

// -------------------------------------------------------------
// Endpoint 33: POST /api/admin/spaces (Tambah Ruangan / Meja Space Baru)
// -------------------------------------------------------------
export async function createAdminSpace(
  payload: CreateSpaceDto | Partial<Space>
): Promise<ApiResponse<Space>> {
  const createdLocal = saveLocalSpace(payload);

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 201,
      message: 'Space baru berhasil ditambahkan! (Demo Mode)',
      data: normalizeSpace(createdLocal),
    };
  }

  try {
    const res = await apiClient<Space>('/api/admin/spaces', {
      method: 'POST',
      body: JSON.stringify(payload),
      requiresAuth: true,
    });

    if (res.status && res.data) {
      saveLocalSpace(res.data);
      return {
        ...res,
        data: normalizeSpace(res.data),
      };
    }
  } catch (err) {
    console.warn('API create space failed, saving locally:', err);
  }

  return {
    status: true,
    statusCode: 201,
    message: 'Space baru berhasil ditambahkan.',
    data: normalizeSpace(createdLocal),
  };
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

  const found = getLocalSpaces().find((s) => s.id_space === id || s.id === id);
  if (found) {
    return {
      status: true,
      statusCode: 200,
      message: 'Data space ditemukan (Lokal)',
      data: normalizeSpace(found),
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
    saveLocalSpace(res.data);
    return {
      ...res,
      data: normalizeSpace(res.data),
    };
  }

  const updated = saveLocalSpace({ ...payload, id_space: id });
  return {
    status: true,
    statusCode: 200,
    message: 'Data space berhasil diperbarui.',
    data: normalizeSpace(updated),
  };
}

// -------------------------------------------------------------
// Endpoint 36: DELETE /api/admin/spaces/{id} (Hapus Data Ruangan / Meja Space)
// -------------------------------------------------------------
export async function deleteAdminSpace(id: number): Promise<ApiResponse<{ id: number; deleted?: boolean }>> {
  deleteLocalSpace(id);

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Space berhasil dihapus! (Demo Mode)',
      data: { id, deleted: true },
    };
  }

  const res = await apiClient<{ id: number; deleted?: boolean }>(`/api/admin/spaces/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });

  if (res.status) {
    return res;
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Space berhasil dihapus.',
    data: { id, deleted: true },
  };
}

// -------------------------------------------------------------
// Endpoint 37: GET /api/admin/diskon (Daftar Semua Kode Promo / Diskon Event)
// -------------------------------------------------------------
export async function getAdminDiscounts(): Promise<ApiResponse<Discount[]>> {
  const localDiscounts = getLocalDiscounts().map(normalizeDiscount);
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: localDiscounts,
    };
  }

  try {
    const res = await apiClient<Discount[]>('/api/admin/diskon', {
      method: 'GET',
      requiresAuth: true,
    });

    if (res.status && Array.isArray(res.data)) {
      const serverList = res.data.map(normalizeDiscount);
      const seenIds = new Set(serverList.map((d) => Number(d.id_diskon || d.id)));
      const uniqueLocal = localDiscounts.filter((d) => !seenIds.has(Number(d.id_diskon || d.id)));
      return {
        ...res,
        data: [...uniqueLocal, ...serverList],
      };
    }
  } catch {
    // fallback
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Memuat data diskon',
    data: localDiscounts,
  };
}

// -------------------------------------------------------------
// Endpoint 38: POST /api/admin/diskon (Tambah Kode Promo / Event Diskon Baru)
// -------------------------------------------------------------
export async function createAdminDiscount(
  payload: CreateDiskonDto | Partial<Discount>
): Promise<ApiResponse<Discount>> {
  const createdLocal = saveLocalDiscount(payload);

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 201,
      message: 'Kode promo baru berhasil dibuat! (Demo Mode)',
      data: normalizeDiscount(createdLocal),
    };
  }

  try {
    const res = await apiClient<Discount>('/api/admin/diskon', {
      method: 'POST',
      body: JSON.stringify(payload),
      requiresAuth: true,
    });

    if (res.status && res.data) {
      saveLocalDiscount(res.data);
      return {
        ...res,
        data: normalizeDiscount(res.data),
      };
    }
  } catch (err) {
    console.warn('API create discount failed, saving locally:', err);
  }

  return {
    status: true,
    statusCode: 201,
    message: 'Kode promo baru berhasil dibuat.',
    data: normalizeDiscount(createdLocal),
  };
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
  const localReservations = getLocalReservations().map(normalizeReservation);

  let merged: Reservation[] = [];
  if (isExplicitDemoMode()) {
    merged = localReservations;
  } else {
    try {
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
        const serverList = res.data.map(normalizeReservation);
        const seenIds = new Set(serverList.map((r) => Number(r.id_reservasi || r.id)));
        const uniqueLocal = localReservations.filter((r) => !seenIds.has(Number(r.id_reservasi || r.id)));
        merged = [...uniqueLocal, ...serverList];
      } else {
        merged = localReservations;
      }
    } catch {
      merged = localReservations;
    }
  }

  // Always filter out deleted reservations (both local and server)
  const deletedReservationIds = new Set(getDeletedReservationIds().map(Number));
  if (deletedReservationIds.size > 0) {
    merged = merged.filter((r) => !deletedReservationIds.has(Number(r.id_reservasi || r.id)));
  }

  // Enrich with local member & space details if missing
  const localMembersList = getLocalMembers();
  const localSpacesList = getLocalSpaces();
  merged = merged.map((r) => {
    let nama_member = r.nama_member;
    if (!nama_member || nama_member === 'Member' || nama_member === 'Pengunjung') {
      const foundMember = localMembersList.find((m) => (m.id_member || m.id) === r.id_member);
      if (foundMember) {
        nama_member = foundMember.nama_member;
      }
    }
    let nama_space = r.nama_space;
    let tipe_space = r.tipe_space;
    let foto_space = r.foto_space;
    if (!nama_space) {
      const foundSpace = localSpacesList.find((s) => (s.id_space || s.id) === r.id_space);
      if (foundSpace) {
        nama_space = foundSpace.nama_space;
        tipe_space = tipe_space || foundSpace.tipe;
        foto_space = foto_space || foundSpace.foto;
      }
    }
    return {
      ...r,
      nama_member: nama_member || r.nama_member || 'Pengunjung',
      nama_space: nama_space || r.nama_space || 'Ruang Kerja',
      tipe_space: tipe_space || r.tipe_space || 'desk',
      foto_space: foto_space || r.foto_space || '',
    };
  });

  let list = merged;
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
    message: 'Berhasil memproses permintaan',
    data: list,
  };
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// Endpoint 43: PATCH /api/admin/reservasi/{id}/status (Konfirmasi & Ubah Status Pemesanan)
// -------------------------------------------------------------
export async function updateReservationStatus(
  id: number,
  status: ReservationStatus
): Promise<ApiResponse<Reservation>> {
  const updatedLocal = updateLocalReservationStatus(id, status);

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: `Status reservasi berhasil diperbarui menjadi ${status} (Demo Mode)`,
      data: normalizeReservation(updatedLocal!),
    };
  }

  try {
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
  } catch (err) {
    console.warn('API updateReservationStatus failed, updated locally:', err);
  }

  return {
    status: true,
    statusCode: 200,
    message: `Status reservasi berhasil diperbarui menjadi ${status}`,
    data: updatedLocal ? normalizeReservation(updatedLocal) : (null as unknown as Reservation),
  };
}

// -------------------------------------------------------------
// Endpoint 44: POST /api/admin/reservasi/{id}/check-in (Check-In Pelanggan -> Aktif)
// -------------------------------------------------------------
export async function checkInReservation(id: number): Promise<ApiResponse<Reservation>> {
  const updatedLocal = updateLocalReservationStatus(id, 'aktif');

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Check-in member berhasil! Status reservasi aktif. (Demo Mode)',
      data: normalizeReservation(updatedLocal!),
    };
  }

  try {
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
  } catch (err) {
    console.warn('API checkInReservation failed, updated locally:', err);
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Check-in member berhasil! Status reservasi aktif.',
    data: updatedLocal ? normalizeReservation(updatedLocal) : (null as unknown as Reservation),
  };
}

// -------------------------------------------------------------
// Endpoint 45: POST /api/admin/reservasi/{id}/check-out (Check-Out Pelanggan -> Selesai)
// -------------------------------------------------------------
export async function checkOutReservation(id: number): Promise<ApiResponse<Reservation>> {
  const updatedLocal = updateLocalReservationStatus(id, 'selesai');

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Check-out member berhasil! Reservasi telah selesai. (Demo Mode)',
      data: normalizeReservation(updatedLocal!),
    };
  }

  try {
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
  } catch (err) {
    console.warn('API checkOutReservation failed, updated locally:', err);
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Check-out member berhasil! Reservasi telah selesai.',
    data: updatedLocal ? normalizeReservation(updatedLocal) : (null as unknown as Reservation),
  };
}

// -------------------------------------------------------------
// Endpoint: DELETE /api/admin/reservasi/{id} (Hapus Reservasi)
// -------------------------------------------------------------
export async function deleteAdminReservation(
  id: number
): Promise<ApiResponse<{ id: number; deleted?: boolean }>> {
  deleteLocalReservation(id);

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Reservasi berhasil dihapus! (Demo Mode)',
      data: { id, deleted: true },
    };
  }

  try {
    const res = await apiClient<{ id: number; deleted?: boolean }>(`/api/admin/reservasi/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });

    if (res.status) {
      return res;
    }
  } catch (err) {
    console.warn('API deleteAdminReservation failed, deleted locally:', err);
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Reservasi berhasil dihapus.',
    data: { id, deleted: true },
  };
}


// -------------------------------------------------------------
// Endpoint 46: GET /api/admin/reports/monthly (Rekapitulasi Estimasi & Realisasi Pendapatan Bulanan)
// -------------------------------------------------------------
export async function getMonthlyReport(params?: {
  month?: string | number;
  year?: string | number;
}): Promise<ApiResponse<MonthlyReport>> {
  const localReport = getLocalMonthlyReport(params);

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: localReport,
    };
  }

  try {
    const query = new URLSearchParams();
    if (params?.month && params.month !== 'all') query.append('month', String(params.month));
    if (params?.year && params.year !== 'all') query.append('year', String(params.year));
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await apiClient<MonthlyReport>(`/api/admin/reports/monthly${queryString}`, {
      method: 'GET',
      requiresAuth: true,
    });

    if (res.status && res.data) {
      if (res.data.total_reservasi !== undefined && res.data.total_reservasi > 0) {
        return res;
      }
      if ((localReport.total_reservasi ?? 0) > 0) {
        return {
          status: true,
          statusCode: 200,
          message: 'Berhasil memproses laporan',
          data: localReport,
        };
      }
      return res;
    }
  } catch (err) {
    console.warn('API getMonthlyReport failed, falling back to local report:', err);
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Berhasil memuat laporan',
    data: localReport,
  };
}

// -------------------------------------------------------------
// Endpoint 47: GET /api/admin/reports/income (Alias Rekapitulasi Pendapatan Bulanan)
// -------------------------------------------------------------
export async function getIncomeReport(params?: {
  month?: string | number;
  year?: string | number;
}): Promise<ApiResponse<IncomeReport>> {
  const localReport = getLocalIncomeReport(params);

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: localReport,
    };
  }

  try {
    const query = new URLSearchParams();
    if (params?.month && params.month !== 'all') query.append('month', String(params.month));
    if (params?.year && params.year !== 'all') query.append('year', String(params.year));
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await apiClient<IncomeReport>(`/api/admin/reports/income${queryString}`, {
      method: 'GET',
      requiresAuth: true,
    });

    if (res.status && res.data) {
      if (res.data.total_pendapatan !== undefined && res.data.total_pendapatan > 0) {
        return res;
      }
      if ((localReport.total_pendapatan ?? 0) > 0) {
        return {
          status: true,
          statusCode: 200,
          message: 'Berhasil memproses laporan pendapatan',
          data: localReport,
        };
      }
      return res;
    }
  } catch (err) {
    console.warn('API getIncomeReport failed, falling back to local report:', err);
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Berhasil memuat laporan pendapatan',
    data: localReport,
  };
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
