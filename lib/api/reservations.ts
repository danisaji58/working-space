import { apiClient, isExplicitDemoMode } from './client';
import {
  ApiResponse,
  Reservation,
  ETicketData,
  CreateReservasiDto,
  ReservationHistorySummary,
} from '@/types/api';
import {
  getLocalReservations,
  getLocalReservationById,
  createLocalReservation,
  updateLocalReservationStatus,
  getLocalETicket,
} from '../storage';

export type CreateReservationPayload = CreateReservasiDto;

function normalizeReservation(r: Reservation): Reservation {
  return {
    ...r,
    id_reservasi: r.id_reservasi ?? r.id,
    id: r.id ?? r.id_reservasi,
    total_harga: r.total_harga ?? r.total_bayar ?? 0,
    total_bayar: r.total_bayar ?? r.total_harga ?? 0,
  };
}

// -------------------------------------------------------------
// Endpoint 19: POST /api/reservasi (Buat Pemesanan Space Baru)
// -------------------------------------------------------------
export async function createReservation(
  payload: CreateReservasiDto
): Promise<ApiResponse<Reservation>> {
  if (isExplicitDemoMode()) {
    const created = createLocalReservation(payload);
    return {
      status: true,
      statusCode: 201,
      message: 'Reservasi berhasil dibuat! Silakan tunggu konfirmasi admin.',
      data: normalizeReservation(created),
    };
  }

  const res = await apiClient<Reservation>('/api/reservasi', {
    method: 'POST',
    body: JSON.stringify(payload),
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
// Endpoint 20: GET /api/reservasi/my (Status Semua Pemesanan Milik Sendiri)
// -------------------------------------------------------------
export async function getMyReservations(): Promise<ApiResponse<Reservation[]>> {
  if (isExplicitDemoMode()) {
    const all = getLocalReservations().map(normalizeReservation);
    const active = all.filter(
      (r) => r.status === 'belum_dikonfirm' || r.status === 'disetujui' || r.status === 'aktif'
    );
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: active,
    };
  }

  const res = await apiClient<Reservation[]>('/api/reservasi/my', {
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
// Endpoint 21: GET /api/reservasi/my/history (Histori Pemesanan Berdasarkan Bulan & Tahun)
// -------------------------------------------------------------
export async function getMyHistory(
  month?: string,
  year?: string
): Promise<ApiResponse<ReservationHistorySummary>> {
  if (isExplicitDemoMode()) {
    let all = getLocalReservations().map(normalizeReservation);
    if (month && month !== 'all') {
      all = all.filter((r) => {
        const rMonth = new Date(r.tanggal_reservasi).getMonth() + 1;
        return String(rMonth) === String(month) || String(rMonth).padStart(2, '0') === month;
      });
    }
    if (year && year !== 'all') {
      all = all.filter((r) => {
        const rYear = new Date(r.tanggal_reservasi).getFullYear();
        return String(rYear) === String(year);
      });
    }

    const totalPengeluaran = all.reduce((sum, item) => sum + (item.total_bayar || item.total_harga || 0), 0);

    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: {
        month: month && month !== 'all' ? Number(month) : undefined,
        year: year && year !== 'all' ? Number(year) : undefined,
        total_reservasi: all.length,
        total_pengeluaran: totalPengeluaran,
        items: all,
      },
    };
  }

  const params = new URLSearchParams();
  if (month && month !== 'all') params.append('month', month);
  if (year && year !== 'all') params.append('year', year);
  const queryString = params.toString() ? `?${params.toString()}` : '';

  const res = await apiClient<unknown>(`/api/reservasi/my/history${queryString}`, {
    method: 'GET',
    requiresAuth: true,
  });

  if (res.status && res.data) {
    // If backend returns array directly
    if (Array.isArray(res.data)) {
      const normalizedItems = (res.data as Reservation[]).map(normalizeReservation);
      const totalPengeluaran = normalizedItems.reduce(
        (sum, item) => sum + (item.total_bayar || item.total_harga || 0),
        0
      );
      return {
        status: true,
        statusCode: res.statusCode,
        message: res.message,
        data: {
          total_reservasi: normalizedItems.length,
          total_pengeluaran: totalPengeluaran,
          items: normalizedItems,
        },
      };
    }

    // If backend returns official { month, year, total_reservasi, total_pengeluaran, items }
    const rawObj = res.data as {
      month?: number;
      year?: number;
      total_reservasi?: number;
      total_pengeluaran?: number;
      items?: Reservation[];
    };

    const items = Array.isArray(rawObj.items)
      ? rawObj.items.map(normalizeReservation)
      : [];

    return {
      status: true,
      statusCode: res.statusCode,
      message: res.message,
      data: {
        month: rawObj.month,
        year: rawObj.year,
        total_reservasi: rawObj.total_reservasi ?? items.length,
        total_pengeluaran:
          rawObj.total_pengeluaran ??
          items.reduce((sum, item) => sum + (item.total_bayar || item.total_harga || 0), 0),
        items,
      },
    };
  }

  return {
    status: false,
    statusCode: res.statusCode,
    message: res.message,
    data: {
      total_reservasi: 0,
      total_pengeluaran: 0,
      items: [],
    },
  };
}

// -------------------------------------------------------------
// Endpoint 22: GET /api/reservasi/{id}/e-ticket (Cetak E-Ticket)
// -------------------------------------------------------------
export async function getETicket(id: number): Promise<ApiResponse<ETicketData>> {
  if (isExplicitDemoMode()) {
    const ticket = getLocalETicket(id);
    if (!ticket) {
      return {
        status: false,
        statusCode: 404,
        message: `E-Ticket untuk reservasi #${id} tidak ditemukan (Demo Mode).`,
        error: 'Not Found',
        data: null as unknown as ETicketData,
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil (Demo Mode)',
      data: ticket,
    };
  }

  const ticketRes = await apiClient<ETicketData>(`/api/reservasi/${id}/e-ticket`, {
    method: 'GET',
    requiresAuth: true,
  });

  if (ticketRes.status && ticketRes.data) {
    const d = ticketRes.data;
    // Normalize fields so ticket page can consume reliably
    const normalizedTicket: ETicketData = {
      ...d,
      nomor_tiket: d.nomor_tiket || d.e_ticket_number || `TICKET-${id}`,
      e_ticket_number: d.e_ticket_number || d.nomor_tiket || `TICKET-${id}`,
      kode_booking: d.kode_booking || `BOOK-${id}`,
      coworking: d.coworking || {
        nama: d.coworking_space?.nama || 'Moklet Hub Coworking Space',
        alamat: d.coworking_space?.alamat || 'Malang, Jawa Timur',
        telp: d.coworking_space?.telepon || '081298765432',
      },
      coworking_space: d.coworking_space || {
        nama: d.coworking?.nama || 'Moklet Hub Coworking Space',
        telepon: d.coworking?.telp || '081298765432',
        alamat: d.coworking?.alamat || 'Malang, Jawa Timur',
      },
      qr_payload: d.qr_payload || d.qr_code_payload || d.kode_booking,
      qr_code_payload: d.qr_code_payload || d.qr_payload || d.kode_booking,
      pembayaran: d.pembayaran || {
        harga_awal: d.rincian_pembayaran?.tarif_kotor || 0,
        potongan: d.rincian_pembayaran?.potongan || 0,
        total_bayar: d.rincian_pembayaran?.total_dibayar || 0,
        kode_promo: d.rincian_pembayaran?.diskon_promo,
        status_reservasi: d.status_reservasi || d.status || 'disetujui',
      },
    };

    return {
      ...ticketRes,
      data: normalizedTicket,
    };
  }

  // If server does not have /e-ticket endpoint, fall back to /api/reservasi/${id}
  const resDetail = await getReservationById(id);
  if (resDetail.status && resDetail.data) {
    const r = resDetail.data;
    const durasi = Number(r.durasi_jam) || 1;
    const hargaPerJam = Number(r.harga_per_jam) || 0;
    const totalHarga = Number(r.total_harga || r.total_bayar) || 0;
    const hargaAwal = r.total_harga_awal || hargaPerJam * durasi;
    const potongan = r.potongan_diskon || Math.max(0, hargaAwal - totalHarga);
    const jamMulai = r.jam_mulai || '09:00';

    const qrPayload = JSON.stringify({
      kode_booking: r.kode_booking || `BOOK-${r.id_reservasi ?? r.id}`,
      id_reservasi: r.id_reservasi ?? r.id,
      member: r.nama_member || 'Pengunjung',
      space: r.nama_space,
      tanggal: r.tanggal_reservasi,
      jam: `${jamMulai} WIB`,
      status: r.status,
    });

    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memuat tiket dari data reservasi.',
      data: {
        nomor_tiket: `TICKET-MOKLET-${r.id_reservasi ?? r.id}`,
        e_ticket_number: `TICKET-MOKLET-${r.id_reservasi ?? r.id}`,
        kode_booking: r.kode_booking || `BOOK-${r.id_reservasi ?? r.id}`,
        coworking_space: {
          nama: 'Moklet Hub Coworking Space',
          telepon: '081298765432',
        },
        coworking: {
          nama: 'Moklet Hub Coworking Space',
          alamat: 'Malang, Jawa Timur',
          telp: '081298765432',
        },
        member: {
          nama: r.nama_member || 'Pengunjung Coworking',
          instansi: 'SMK Telkom Malang',
          telp: '-',
          username: 'member',
        },
        space: {
          id: r.id_space || 0,
          nama: r.nama_space || 'Workstation',
          tipe: r.tipe_space || 'desk',
          kapasitas: 1,
          harga_per_jam: hargaPerJam,
        },
        jadwal: {
          tanggal: r.tanggal_reservasi,
          jam_mulai: jamMulai,
          durasi_jam: durasi,
          durasi: `${durasi} Jam`,
          jam_selesai: r.jam_selesai || `${durasi} jam setelah mulai`,
        },
        rincian_pembayaran: {
          tarif_kotor: hargaAwal,
          diskon_promo: r.kode_promo || '',
          potongan,
          total_dibayar: totalHarga,
        },
        pembayaran: {
          harga_awal: hargaAwal,
          potongan,
          total_bayar: totalHarga,
          status_reservasi: r.status,
        },
        status_reservasi: r.status,
        qr_code_payload: qrPayload,
        qr_payload: qrPayload,
      },
    };
  }

  return ticketRes;
}

// -------------------------------------------------------------
// Endpoint 23: GET /api/reservasi/{id} (Lihat Detail Reservasi)
// -------------------------------------------------------------
export async function getReservationById(id: number): Promise<ApiResponse<Reservation>> {
  if (isExplicitDemoMode()) {
    const found = getLocalReservationById(id);
    if (!found) {
      return {
        status: false,
        statusCode: 404,
        message: `Reservasi #${id} tidak ditemukan (Demo Mode).`,
        error: 'Not Found',
        data: null as unknown as Reservation,
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Berhasil memproses permintaan (Demo Mode)',
      data: normalizeReservation(found),
    };
  }

  const res = await apiClient<Reservation>(`/api/reservasi/${id}`, {
    method: 'GET',
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
// Endpoint 24: PATCH /api/reservasi/{id}/cancel (Batalkan Pemesanan)
// -------------------------------------------------------------
export async function cancelReservation(id: number): Promise<ApiResponse<Reservation>> {
  if (isExplicitDemoMode()) {
    const updated = updateLocalReservationStatus(id, 'dibatalkan');
    if (!updated) {
      return {
        status: false,
        statusCode: 404,
        message: 'Gagal membatalkan: Reservasi tidak ditemukan (Demo Mode).',
        error: 'Not Found',
        data: null as unknown as Reservation,
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: 'Reservasi berhasil dibatalkan oleh pengguna',
      data: normalizeReservation(updated),
    };
  }

  const res = await apiClient<Reservation>(`/api/reservasi/${id}/cancel`, {
    method: 'PATCH',
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
