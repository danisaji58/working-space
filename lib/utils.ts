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

export const FALLBACK_MEMBER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
];

// Persistent local upload cache so user-uploaded local files never revert/disappear
export function saveUploadedImageCache(type: 'spaces' | 'members', id: number | string, dataUrl: string): void {
  if (typeof window === 'undefined' || !id || !dataUrl) return;
  try {
    const key = `ssb_cache_${type}_images`;
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[String(id)] = dataUrl;
    parsed[String(id).toLowerCase()] = dataUrl;
    localStorage.setItem(key, JSON.stringify(parsed));
  } catch {
    // quota exceeded or SSR
  }
}

export function getUploadedImageCache(type: 'spaces' | 'members', id: number | string): string | null {
  if (typeof window === 'undefined' || !id) return null;
  try {
    const key = `ssb_cache_${type}_images`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed[String(id)] || parsed[String(id).toLowerCase()] || null;
  } catch {
    return null;
  }
}

export function normalizeUploadUrl(
  urlOrFilename: string | undefined | null,
  type: 'spaces' | 'members' | 'general' = 'spaces'
): string {
  if (!urlOrFilename) return '';
  const raw = urlOrFilename.trim();
  if (!raw) return '';

  // 1. Data URLs (Base64) or Blob URLs — return directly
  if (raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }

  // 2. Fix official server upload URL bug (it omits /coworking/ and uses http)
  if (raw.includes('learn.smktelkom-mlg.sch.id/uploads/')) {
    return raw
      .replace('http://', 'https://')
      .replace('learn.smktelkom-mlg.sch.id/uploads/', 'learn.smktelkom-mlg.sch.id/coworking/uploads/');
  }

  // 3. Absolute URL (e.g. Unsplash or already valid https)
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  // 4. Relative paths
  if (raw.startsWith('/coworking/uploads/')) {
    return `https://learn.smktelkom-mlg.sch.id${raw}`;
  }
  if (raw.startsWith('/uploads/')) {
    return `https://learn.smktelkom-mlg.sch.id/coworking${raw}`;
  }

  // 5. Raw filename from server (e.g. "1789652241876-613063422.png" or "meeting_alpha.jpg")
  return `https://learn.smktelkom-mlg.sch.id/coworking/uploads/${type}/${raw}`;
}

export function resolveSpaceImage(
  space: { foto?: string; foto_url?: string; id?: number; id_space?: number } | null | undefined
): string {
  if (!space) return FALLBACK_IMAGES[0];

  const targetId = space.id_space ?? space.id;
  if (targetId) {
    const cached = getUploadedImageCache('spaces', targetId);
    if (cached) return cached;
  }

  const raw = space.foto_url || space.foto;
  if (raw && raw.trim().length > 0) {
    return normalizeUploadUrl(raw, 'spaces');
  }

  const id = (targetId ?? 1) as number;
  return FALLBACK_IMAGES[(Math.abs(id) - 1) % FALLBACK_IMAGES.length] || FALLBACK_IMAGES[0];
}

export function resolveMemberImage(
  member: { foto?: string; foto_url?: string; id?: number; id_member?: number; username?: string } | null | undefined
): string {
  if (!member) return FALLBACK_MEMBER_AVATARS[0];

  const targetId = member.id_member ?? member.id;
  if (targetId) {
    const cached = getUploadedImageCache('members', targetId);
    if (cached) return cached;
  }
  if (member.username) {
    const cached = getUploadedImageCache('members', member.username);
    if (cached) return cached;
  }

  const raw = member.foto_url || member.foto;
  if (raw && raw.trim().length > 0) {
    return normalizeUploadUrl(raw, 'members');
  }

  const id = (targetId ?? 1) as number;
  return FALLBACK_MEMBER_AVATARS[(Math.abs(id) - 1) % FALLBACK_MEMBER_AVATARS.length] || FALLBACK_MEMBER_AVATARS[0];
}
