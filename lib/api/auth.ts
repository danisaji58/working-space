import { apiClient, setAuthToken, removeAuthToken, isExplicitDemoMode } from './client';
import { ApiResponse, UserSession, Member, AdminProfile } from '@/types/api';
import { saveLocalMember } from '../storage';
import { saveUploadedImageCache } from '../utils';

export interface RegisterMemberPayload {
  username: string;
  password?: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string;
}

export interface RegisterAdminPayload {
  username: string;
  password?: string;
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
}

export interface LoginPayload {
  username: string;
  password?: string;
}

export async function registerMember(payload: RegisterMemberPayload): Promise<ApiResponse<Member>> {
  // Save locally first to guarantee persistence in member list & offline capability
  const local = saveLocalMember(payload);
  const mid = local.id_member || local.id;
  if (payload.foto) {
    if (mid) saveUploadedImageCache('members', mid, payload.foto);
    if (local.username) saveUploadedImageCache('members', local.username, payload.foto);
  }

  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 201,
      message: 'Registrasi member berhasil (Demo Simulation Mode).',
      data: local,
    };
  }

  try {
    const res = await apiClient<Member>('/api/auth/register/member', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.status && res.data) {
      const serverMid = res.data.id_member || res.data.id || mid;
      const memberWithFoto: Member = {
        ...res.data,
        id_member: serverMid,
        id: serverMid,
        foto: res.data.foto || payload.foto,
      };
      saveLocalMember(memberWithFoto);
      if (payload.foto) {
        if (serverMid) saveUploadedImageCache('members', serverMid, payload.foto);
        if (memberWithFoto.username) saveUploadedImageCache('members', memberWithFoto.username, payload.foto);
      }
      return {
        ...res,
        data: memberWithFoto,
      };
    }
  } catch (err) {
    console.warn('Backend registerMember error, fallback to local storage:', err);
  }

  return {
    status: true,
    statusCode: 201,
    message: 'Registrasi member berhasil.',
    data: local,
  };
}

export async function registerAdmin(payload: RegisterAdminPayload): Promise<ApiResponse<AdminProfile>> {
  if (isExplicitDemoMode()) {
    const mockAdmin: AdminProfile = {
      id_admin: 1,
      id: 1,
      username: payload.username,
      nama_coworking: payload.nama_coworking,
      nama_pemilik: payload.nama_pemilik,
      alamat: 'Jl. Danau Ranau No. 1, Sawojajar, Kota Malang',
      telp: payload.telp,
      deskripsi_fasilitas: 'Coworking space modern dengan fasilitas lengkap.',
    };

    return {
      status: true,
      statusCode: 201,
      message: 'Registrasi admin coworking berhasil (Demo Simulation Mode).',
      data: mockAdmin,
    };
  }

  return apiClient<AdminProfile>('/api/auth/register/admin-space', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse<UserSession>> {
  if (isExplicitDemoMode()) {
    const isAdmin =
      payload.username.toLowerCase().includes('admin') ||
      payload.username.toLowerCase() === 'thehive';

    const mockToken = `demo_token_${Date.now()}`;
    setAuthToken(mockToken);

    let session: UserSession;
    if (isAdmin) {
      session = {
        token: mockToken,
        role: 'admin_space',
        user: {
          id: 1,
          username: payload.username,
          nama: 'Administrator The Hive (Demo)',
          nama_coworking: 'The Hive Sanctuary Coworking',
          telp: '0811-3456-789',
        },
      };
    } else {
      session = {
        token: mockToken,
        role: 'member',
        user: {
          id: 101,
          username: payload.username,
          nama: payload.username,
          instansi: 'SMK Telkom Malang',
          telp: '081234567890',
        },
      };
    }

    return {
      status: true,
      statusCode: 200,
      message: `Login berhasil (Mode Demo Terpilih: ${session.role})`,
      data: session,
    };
  }

  // Real official API call
  const res = await apiClient<{
    token?: string;
    role?: string;
    user?: UserSession['user'];
    [key: string]: unknown;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.status && res.data) {
    const rawData = res.data;
    const token = (rawData.token || (rawData as unknown as { access_token?: string }).access_token || '') as string;
    if (token) {
      setAuthToken(token);
    }

    // Determine role from API response or user role
    const inferredRole: 'admin_space' | 'member' =
      rawData.role === 'admin_space' ||
      rawData.role === 'admin' ||
      (rawData.user && (rawData.user as unknown as { role?: string }).role === 'admin_space')
        ? 'admin_space'
        : 'member';

    const session: UserSession = {
      token,
      role: inferredRole,
      user: rawData.user || {
        id: ((rawData as unknown as { id?: number }).id || 1),
        username: payload.username,
        nama: ((rawData as unknown as { nama?: string }).nama || payload.username),
      },
    };

    return {
      status: true,
      statusCode: res.statusCode,
      message: res.message || 'Login berhasil.',
      data: session,
    };
  }

  // If real API returned error (e.g. 401 Unauthorized), return the real error
  return {
    status: false,
    statusCode: res.statusCode,
    message: res.message || 'Username atau password salah.',
    error: res.error,
    data: null as unknown as UserSession,
  };
}

export async function getProfile(): Promise<ApiResponse<UserSession['user']>> {
  return apiClient<UserSession['user']>('/api/auth/profile', {
    method: 'GET',
    requiresAuth: true,
  });
}

export function logoutUser(): void {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ssb_user_session');
  }
}
