import { apiClient, isExplicitDemoMode } from './client';
import { ApiResponse, Discount } from '@/types/api';
import { getLocalDiscounts, checkLocalDiscount } from '../storage';

function normalizeDiscount(d: Discount): Discount {
  return {
    ...d,
    id_diskon: d.id_diskon ?? d.id,
    id: d.id ?? d.id_diskon,
  };
}

// -------------------------------------------------------------
// Endpoint 16: GET /api/diskon/active (Daftar Promo Aktif)
// -------------------------------------------------------------
export async function getActiveDiscounts(): Promise<ApiResponse<Discount[]>> {
  if (isExplicitDemoMode()) {
    const discounts = getLocalDiscounts()
      .filter((d) => d.is_active !== false)
      .map(normalizeDiscount);
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: discounts,
    };
  }

  const res = await apiClient<Discount[]>('/api/diskon/active');
  if (res.status && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.map(normalizeDiscount),
    };
  }
  return res;
}

// -------------------------------------------------------------
// Endpoint 17: POST /api/diskon/check (Periksa Validitas Kode Promo)
// -------------------------------------------------------------
export async function checkDiscount(nama_diskon: string): Promise<ApiResponse<Discount>> {
  if (isExplicitDemoMode()) {
    const found = checkLocalDiscount(nama_diskon);
    if (!found) {
      return {
        status: false,
        statusCode: 400,
        message: 'Kode promo tidak ditemukan atau sudah kedaluwarsa!',
        error: 'Bad Request',
        data: null as unknown as Discount,
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Kode promo valid dan masih berlaku!',
      data: normalizeDiscount(found),
    };
  }

  // Official API: POST /api/diskon/check with { nama_diskon }
  const res = await apiClient<{
    id?: number;
    nama_diskon?: string;
    persentase_diskon?: number;
    tanggal_awal?: string;
    tanggal_akhir?: string;
    is_active?: boolean;
    diskon?: Discount;
    [key: string]: unknown;
  }>('/api/diskon/check', {
    method: 'POST',
    body: JSON.stringify({ nama_diskon }),
  });

  if (res.status && res.data) {
    const discountObj = (res.data.diskon || res.data) as Discount;
    return {
      status: true,
      statusCode: res.statusCode,
      message: res.message || 'Kode promo valid dan masih berlaku!',
      data: normalizeDiscount(discountObj),
    };
  }

  return {
    status: false,
    statusCode: res.statusCode || 400,
    message: res.message || 'Kode promo tidak ditemukan atau sudah kedaluwarsa!',
    error: res.error || 'Bad Request',
    data: null as unknown as Discount,
  };
}

// -------------------------------------------------------------
// Endpoint 18: GET /api/diskon/{id} (Lihat Detail Diskon by ID)
// -------------------------------------------------------------
export async function getDiscountById(id: number): Promise<ApiResponse<Discount>> {
  if (isExplicitDemoMode()) {
    const discounts = getLocalDiscounts();
    const found = discounts.find((d) => d.id_diskon === id || d.id === id);
    if (!found) {
      return {
        status: false,
        statusCode: 404,
        message: 'Diskon dengan ID tersebut tidak ditemukan!',
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

  const res = await apiClient<Discount>(`/api/diskon/${id}`);
  if (res.status && res.data) {
    return {
      ...res,
      data: normalizeDiscount(res.data),
    };
  }
  return res;
}
