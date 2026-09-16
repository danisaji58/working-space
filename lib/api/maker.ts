import { apiClient, isExplicitDemoMode, getMakerKey } from './client';
import {
  ApiResponse,
  RootApiInfo,
  HealthCheckResponse,
  RegisterMakerDto,
  LoginMakerDto,
  MakerUser,
  MakerStats,
  MakerListItem,
} from '@/types/api';

// -------------------------------------------------------------
// Endpoint 1: GET / (Status API & Petunjuk Penggunaan)
// -------------------------------------------------------------
export async function getRootInfo(): Promise<ApiResponse<RootApiInfo>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: {
        name: 'Coworking Space Backend API - UKK RPL Paket B',
        version: '1.0.0',
        status: 'online',
        swagger_docs: '/docs',
        description: 'Backend service untuk menunjang kelas frontend dalam ujian UKK dengan multi-tenancy App Maker.',
        documentation_links: {
          swagger: 'https://learn.smktelkom-mlg.sch.id/coworking/docs',
          swagger_json: 'https://learn.smktelkom-mlg.sch.id/coworking/docs-json',
        },
      },
    };
  }

  return apiClient<RootApiInfo>('/', {
    method: 'GET',
  });
}

// -------------------------------------------------------------
// Endpoint 2: GET /health (Health Check Server)
// -------------------------------------------------------------
export async function getHealthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
  }

  return apiClient<HealthCheckResponse>('/health', {
    method: 'GET',
  });
}

// -------------------------------------------------------------
// Endpoint 3: POST /api/maker/register (Registrasi Akun Siswa & App Key)
// -------------------------------------------------------------
export async function registerMaker(payload: RegisterMakerDto): Promise<ApiResponse<MakerUser>> {
  if (isExplicitDemoMode()) {
    const mockKey = `mk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const mockUser: MakerUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      name: payload.name,
      username: payload.username,
      email: payload.email,
      app_key: mockKey,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      access_token: `mock_maker_token_${Date.now()}`,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_maker_key', mockKey);
      localStorage.setItem('maker_user', JSON.stringify(mockUser));
    }

    return {
      status: true,
      statusCode: 201,
      message: 'Registrasi App Maker berhasil! Simpan app_key Anda dengan baik.',
      data: mockUser,
    };
  }

  const res = await apiClient<MakerUser>('/api/maker/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.status && res.data?.app_key) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_maker_key', res.data.app_key);
      localStorage.setItem('maker_user', JSON.stringify(res.data));
      if (res.data.access_token) {
        localStorage.setItem('maker_token', res.data.access_token);
      }
    }
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 4: POST /api/maker/login (Login Akun Siswa Pengembang Frontend)
// -------------------------------------------------------------
export async function loginMaker(payload: LoginMakerDto): Promise<ApiResponse<MakerUser>> {
  if (isExplicitDemoMode()) {
    const mockKey = getMakerKey() || 'mk_default_ukk_2026';
    const mockUser: MakerUser = {
      id: 5,
      name: 'Peserta Ujian UKK',
      username: payload.usernameOrEmail,
      email: `${payload.usernameOrEmail}@smk.sch.id`,
      app_key: mockKey,
      access_token: `mock_maker_token_${Date.now()}`,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_maker_key', mockKey);
      localStorage.setItem('maker_user', JSON.stringify(mockUser));
    }

    return {
      status: true,
      statusCode: 200,
      message: 'Login App Maker berhasil!',
      data: mockUser,
    };
  }

  const res = await apiClient<MakerUser>('/api/maker/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (res.status && res.data?.app_key) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_maker_key', res.data.app_key);
      localStorage.setItem('maker_user', JSON.stringify(res.data));
      if (res.data.access_token) {
        localStorage.setItem('maker_token', res.data.access_token);
      }
    }
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 5: GET /api/maker/me (Lihat Profil & App Key Siswa Saat Ini)
// -------------------------------------------------------------
export async function getMakerMe(): Promise<ApiResponse<MakerUser>> {
  if (isExplicitDemoMode()) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('maker_user') : null;
    if (saved) {
      try {
        return {
          status: true,
          statusCode: 200,
          message: 'Berhasil memproses permintaan (Demo Mode)',
          data: JSON.parse(saved),
        };
      } catch {
        // fallback
      }
    }

    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: {
        id: 5,
        name: 'Peserta Ujian UKK',
        username: 'siswa_ukk',
        email: 'siswa@smk.sch.id',
        app_key: getMakerKey() || 'mk_default_ukk_2026',
        created_at: new Date().toISOString(),
      },
    };
  }

  const makerToken = typeof window !== 'undefined' ? localStorage.getItem('maker_token') : null;
  const customHeaders: Record<string, string> = {};
  if (makerToken) {
    customHeaders['Authorization'] = `Bearer ${makerToken}`;
  }

  return apiClient<MakerUser>('/api/maker/me', {
    method: 'GET',
    headers: customHeaders,
  });
}

// -------------------------------------------------------------
// Endpoint 6: GET /api/maker/stats (Statistik Keseluruhan Data Siswa)
// -------------------------------------------------------------
export async function getMakerStats(): Promise<ApiResponse<MakerStats>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: {
        total_members: 6,
        total_spaces: 4,
        total_diskon: 3,
        total_reservasi: 12,
        total_pendapatan: 1450000,
      },
    };
  }

  const makerToken = typeof window !== 'undefined' ? localStorage.getItem('maker_token') : null;
  const customHeaders: Record<string, string> = {};
  if (makerToken) {
    customHeaders['Authorization'] = `Bearer ${makerToken}`;
  }

  return apiClient<MakerStats>('/api/maker/stats', {
    method: 'GET',
    headers: customHeaders,
  });
}

// -------------------------------------------------------------
// Endpoint 7: GET /api/maker/list (Daftar Semua Siswa / App Maker Terdaftar)
// -------------------------------------------------------------
export async function getMakerList(): Promise<ApiResponse<MakerListItem[]>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: [
        {
          id: 1,
          name: 'Admin Default UKK',
          username: 'admin_default',
          email: 'admin@ukk.sch.id',
          app_key: 'mk_default_ukk_2026',
          created_at: '2026-08-27T00:00:00.000Z',
        },
        {
          id: 5,
          name: 'Budi Santoso',
          username: 'budisantoso',
          email: 'budi@smk.sch.id',
          app_key: 'mk_4ffb8c4b40a6499ea7767bfafb32f6e0',
          created_at: '2026-08-27T02:58:34.092Z',
        },
      ],
    };
  }

  return apiClient<MakerListItem[]>('/api/maker/list', {
    method: 'GET',
  });
}
