import { ReservationStatus, SpaceType } from '@/types/api';

export function cn(...inputs: (string | number | boolean | null | undefined | unknown)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatIDR(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function calculateEndTime(startTime: string, durationHours: number): string {
  if (!startTime) return '';
  const [hours, minutes] = startTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return startTime;

  const totalMinutes = hours * 60 + minutes + durationHours * 60;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

export function calculatePrice(hourlyPrice: number, durationHours: number, discountPercent: number = 0) {
  const basePrice = Math.max(0, hourlyPrice * Math.max(1, durationHours));
  const discountAmount = Math.round((basePrice * Math.min(100, Math.max(0, discountPercent))) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return {
    basePrice,
    discountAmount,
    finalPrice,
  };
}

export function getStatusConfig(status: ReservationStatus) {
  switch (status) {
    case 'belum_dikonfirm':
      return {
        label: 'Menunggu Konfirmasi',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        description: 'Menunggu persetujuan admin',
      };
    case 'disetujui':
      return {
        label: 'Disetujui',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        description: 'Telah disetujui, siap check-in',
      };
    case 'aktif':
      return {
        label: 'Sesi Aktif',
        badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        description: 'Pengunjung telah check-in',
      };
    case 'selesai':
      return {
        label: 'Selesai',
        badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        description: 'Sesi reservasi telah berakhir',
      };
    case 'dibatalkan':
      return {
        label: 'Dibatalkan',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        description: 'Reservasi dibatalkan',
      };
    default:
      return {
        label: status || 'Pending',
        badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        description: '',
      };
  }
}

export function getSpaceTypeLabel(type: SpaceType): string {
  switch (type?.toLowerCase()) {
    case 'desk':
    case 'personal desk':
    case 'personal_desk':
      return 'Personal Desk';
    case 'meeting_room':
    case 'meeting room':
      return 'Meeting Room';
    case 'private_office':
    case 'private office':
      return 'Private Office';
    default:
      return type || 'Workstation';
  }
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
];

export function resolveSpaceImage(
  space: { foto?: string; foto_url?: string; id?: number; id_space?: number } | null | undefined
): string {
  if (!space) return FALLBACK_IMAGES[0];

  // 1. If foto_url is provided and is absolute URL
  if (space.foto_url && (space.foto_url.startsWith('http://') || space.foto_url.startsWith('https://'))) {
    return space.foto_url;
  }

  // 2. If foto is an absolute URL
  if (space.foto && (space.foto.startsWith('http://') || space.foto.startsWith('https://'))) {
    return space.foto;
  }

  // 3. If foto is a filename from the official server
  if (space.foto && space.foto.trim().length > 0) {
    const filename = space.foto.trim();
    return `http://learn.smktelkom-mlg.sch.id/uploads/spaces/${filename}`;
  }

  const id = (space.id_space ?? space.id ?? 1) as number;
  return FALLBACK_IMAGES[(Math.abs(id) - 1) % FALLBACK_IMAGES.length] || FALLBACK_IMAGES[0];
}
