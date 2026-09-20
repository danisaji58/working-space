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

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'M';
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  if (!clean) return 'M';
  const rawParts = clean.split(/\s+/).filter(Boolean);
  const alphaParts = rawParts.filter((p) => /[a-zA-Z]/.test(p));
  const parts = alphaParts.length > 0 ? alphaParts : rawParts;

  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const AVATAR_PALETTES = [
  { bg: '#2563eb', text: '#ffffff' }, // Blue
  { bg: '#7c3aed', text: '#ffffff' }, // Purple
  { bg: '#059669', text: '#ffffff' }, // Emerald
  { bg: '#d97706', text: '#ffffff' }, // Amber
  { bg: '#e11d48', text: '#ffffff' }, // Rose
  { bg: '#0891b2', text: '#ffffff' }, // Cyan
  { bg: '#4f46e5', text: '#ffffff' }, // Indigo
  { bg: '#c026d3', text: '#ffffff' }, // Fuchsia
  { bg: '#ea580c', text: '#ffffff' }, // Orange
  { bg: '#0d9488', text: '#ffffff' }, // Teal
];

export function getInitialsAvatarSvg(name?: string, id?: number | string): string {
  const initials = getInitials(name);
  let index = 0;
  if (typeof id === 'number' && !isNaN(id)) {
    index = Math.abs(id) % AVATAR_PALETTES.length;
  } else if (name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    index = Math.abs(hash) % AVATAR_PALETTES.length;
  }
  const { bg, text } = AVATAR_PALETTES[index];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100" height="100" fill="${bg}" rx="50"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${text}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="38" letter-spacing="1">
    ${initials}
  </text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const FALLBACK_MEMBER_AVATARS = AVATAR_PALETTES.map((_, i) =>
  getInitialsAvatarSvg('Member', i + 1)
);

// Persistent local upload cache so user-uploaded local files never revert/disappear
export function saveUploadedImageCache(type: 'spaces' | 'members', id: number | string, dataUrl: string): void {
  if (typeof window === 'undefined' || !id || !dataUrl) return;
  try {
    const key = `ssb_cache_${type}_images`;
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[String(id)] = dataUrl;
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
    return parsed[String(id)] || null;
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
  member: {
    foto?: string;
    foto_url?: string;
    id?: number;
    id_member?: number;
    nama?: string;
    nama_member?: string;
    username?: string;
  } | null | undefined
): string {
  const name = member?.nama_member || member?.nama || member?.username || 'Member';
  const targetId = member?.id_member ?? member?.id;

  if (!member) {
    return getInitialsAvatarSvg('Member', 1);
  }

  if (targetId) {
    const cached = getUploadedImageCache('members', targetId);
    if (cached) return cached;
  }

  const raw = member.foto_url || member.foto;
  if (raw && raw.trim().length > 0) {
    // If the image is an Unsplash stock avatar, treat as no custom photo and use initials!
    const isUnsplashStock = raw.includes('images.unsplash.com/photo-');
    if (!isUnsplashStock) {
      return normalizeUploadUrl(raw, 'members');
    }
  }

  return getInitialsAvatarSvg(name, targetId);
}

export async function compressImage(
  file: File,
  maxWidth: number = 600,
  maxHeight: number = 600,
  quality: number = 0.85
): Promise<{ file: File; base64: string }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ file, base64: (reader.result as string) || '' });
      reader.onerror = () => resolve({ file, base64: '' });
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve({ file, base64: (reader.result as string) || '' });
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, base64: canvas.toDataURL('image/jpeg', quality) });
            return;
          }

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve({ file: compressedFile, base64 });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => resolve({ file, base64: (reader.result as string) || '' });
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

