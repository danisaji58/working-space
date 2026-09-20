import { apiClient, isExplicitDemoMode } from './client';
import {
  ApiResponse,
  Space,
  SpaceTypeInfo,
  SpaceType,
  SpaceAvailabilityQuery,
  SpaceAvailabilityResult,
} from '@/types/api';
import { getLocalSpaces, getLocalSpaceById, getLocalReservations } from '../storage';
import { calculateEndTime } from '../utils';

function normalizeSpace(space: Space): Space {
  return {
    ...space,
    id_space: space.id_space ?? space.id,
    id: space.id ?? space.id_space,
  };
}

// -------------------------------------------------------------
// Endpoint 12: GET /api/spaces/types (Daftar Tipe Space)
// -------------------------------------------------------------
export async function getSpaceTypes(): Promise<ApiResponse<SpaceTypeInfo[]>> {
  if (isExplicitDemoMode()) {
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: [
        {
          tipe: 'desk',
          label: 'Personal Desk',
          deskripsi: 'Meja kerja individual yang nyaman dengan fasilitas colokan listrik, WiFi kencang, dan air minum.',
        },
        {
          tipe: 'meeting_room',
          label: 'Meeting Room',
          deskripsi: 'Ruang rapat tertutup dengan fasilitas proyektor/TV LED, whiteboard, sound system, dan AC dingin.',
        },
        {
          tipe: 'private_office',
          label: 'Private Office',
          deskripsi: 'Ruang kantor privat eksklusif untuk tim kecil hingga menengah dengan akses fleksibel dan keamanan 24 jam.',
        },
      ],
    };
  }

  return apiClient<SpaceTypeInfo[]>('/api/spaces/types');
}

// -------------------------------------------------------------
// Endpoint 13: GET /api/spaces/availability (Cek Ketersediaan Space)
// -------------------------------------------------------------
export async function checkSpaceAvailability(
  query: SpaceAvailabilityQuery
): Promise<ApiResponse<SpaceAvailabilityResult>> {
  if (isExplicitDemoMode()) {
    const space = getLocalSpaceById(query.id_space);
    if (!space) {
      return {
        status: false,
        statusCode: 404,
        message: 'Space tidak ditemukan',
        error: 'Not Found',
        data: null as unknown as SpaceAvailabilityResult,
      };
    }

    // Check collision in local storage
    const allReservations = getLocalReservations();
    const collision = allReservations.some(
      (r) =>
        (r.id_space === query.id_space || r.id === query.id_space) &&
        r.tanggal_reservasi === query.tanggal &&
        r.status !== 'dibatalkan' &&
        r.status !== 'selesai' &&
        r.jam_mulai === query.jam_mulai
    );

    if (collision) {
      return {
        status: false,
        statusCode: 400,
        message: 'Maaf, space sudah terisi atau dibooking pada jam tersebut!',
        error: 'Bad Request',
        data: {
          available: false,
          id_space: query.id_space,
          nama_space: space.nama_space,
          tanggal: query.tanggal,
          jam_mulai: query.jam_mulai,
          jam_selesai: calculateEndTime(query.jam_mulai, query.durasi_jam),
          durasi_jam: query.durasi_jam,
          harga_per_jam: space.harga_per_jam,
          estimasi_total: space.harga_per_jam * query.durasi_jam,
        },
      };
    }

    const jamSelesai = calculateEndTime(query.jam_mulai, query.durasi_jam);
    return {
      status: true,
      statusCode: 200,
      message: 'Space tersedia untuk dipesan pada jadwal yang diminta',
      data: {
        available: true,
        id_space: query.id_space,
        nama_space: space.nama_space,
        tanggal: query.tanggal,
        jam_mulai: query.jam_mulai,
        jam_selesai: jamSelesai,
        durasi_jam: query.durasi_jam,
        harga_per_jam: space.harga_per_jam,
        estimasi_total: space.harga_per_jam * query.durasi_jam,
      },
    };
  }

  const params = new URLSearchParams({
    id_space: String(query.id_space),
    tanggal: query.tanggal,
    jam_mulai: query.jam_mulai,
    durasi_jam: String(query.durasi_jam),
  });

  return apiClient<SpaceAvailabilityResult>(`/api/spaces/availability?${params.toString()}`);
}

// Alias for backwards compatibility
export const getSpaceAvailability = checkSpaceAvailability;

let _cachedSpacesResponse: ApiResponse<Space[]> | null = null;
let _lastSpacesCacheTime = 0;
const SPACES_CACHE_TTL = 30000; // 30 detik

// Endpoint 14: GET /api/spaces (Lihat Semua Space Coworking)
// -------------------------------------------------------------
export async function getSpaces(params?: {
  tipe?: SpaceType;
  search?: string;
}): Promise<ApiResponse<Space[]>> {
  const isDefaultQuery = (!params?.tipe || params.tipe === 'all') && !params?.search;

  // Use memory cache for default list if fresh
  if (isDefaultQuery && _cachedSpacesResponse && Date.now() - _lastSpacesCacheTime < SPACES_CACHE_TTL) {
    return _cachedSpacesResponse;
  }

  if (isExplicitDemoMode()) {
    let spaces = getLocalSpaces().map(normalizeSpace);
    if (params?.tipe && params.tipe !== 'all') {
      spaces = spaces.filter((s) => s.tipe === params.tipe);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      spaces = spaces.filter(
        (s) =>
          s.nama_space.toLowerCase().includes(q) ||
          s.deskripsi.toLowerCase().includes(q)
      );
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: spaces,
    };
  }

  const queryParts: string[] = [];
  if (params?.tipe && params.tipe !== 'all') {
    queryParts.push(`tipe=${encodeURIComponent(params.tipe)}`);
  }
  if (params?.search) {
    queryParts.push(`search=${encodeURIComponent(params.search)}`);
  }
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  const res = await apiClient<Space[]>(`/api/spaces${queryString}`);
  if (res.status && Array.isArray(res.data)) {
    const normalizedResult: ApiResponse<Space[]> = {
      ...res,
      data: res.data.map(normalizeSpace),
    };
    if (isDefaultQuery) {
      _cachedSpacesResponse = normalizedResult;
      _lastSpacesCacheTime = Date.now();
    }
    return normalizedResult;
  }

  return res;
}

// -------------------------------------------------------------
// Endpoint 15: GET /api/spaces/{id} (Lihat Detail Space Coworking)
// -------------------------------------------------------------
export async function getSpaceById(id: number): Promise<ApiResponse<Space>> {
  if (isExplicitDemoMode()) {
    const space = getLocalSpaceById(id);
    if (!space) {
      return {
        status: false,
        statusCode: 404,
        message: 'Space dengan ID tersebut tidak ditemukan!',
        error: 'Not Found',
        data: null as unknown as Space,
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: normalizeSpace(space),
    };
  }

  const res = await apiClient<Space>(`/api/spaces/${id}`);
  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeSpace(res.data),
    };
  }
  return res;
}
