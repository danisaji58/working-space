'use client';

import React, { useState } from 'react';
import { getInitials } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  id?: number | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  showBorder?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-14 h-14 text-base font-semibold',
  xl: 'w-24 h-24 text-2xl font-bold',
};

// Curated harmonious modern color gradients for dark mode
const GRADIENT_PALETTES = [
  'from-blue-600 to-indigo-600 text-white',
  'from-purple-600 to-indigo-700 text-white',
  'from-emerald-600 to-teal-700 text-white',
  'from-amber-600 to-orange-600 text-white',
  'from-rose-600 to-pink-600 text-white',
  'from-cyan-600 to-blue-600 text-white',
  'from-violet-600 to-purple-600 text-white',
  'from-teal-600 to-emerald-600 text-white',
];

function getPaletteIndex(name?: string, id?: number | string): number {
  if (typeof id === 'number' && !isNaN(id)) {
    return Math.abs(id) % GRADIENT_PALETTES.length;
  }
  if (name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % GRADIENT_PALETTES.length;
  }
  return 0;
}

export function UserAvatar({
  src,
  name = 'Member',
  id,
  size = 'md',
  className = '',
  alt,
  showBorder = true,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Check if src is an Unsplash stock photo (AI / generic stock photo)
  const isStockPhoto = src && src.includes('images.unsplash.com/photo-');
  const validCustomSrc = !isStockPhoto && !hasError && src && src.trim().length > 0;

  const initials = getInitials(name);
  const palette = GRADIENT_PALETTES[getPaletteIndex(name, id)];
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const borderClass = showBorder ? 'border border-zinc-700/60 shadow-sm' : '';

  if (validCustomSrc) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 bg-zinc-800 flex items-center justify-center ${sizeClass} ${borderClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Fallback: Elegant initials badge with smooth gradient
  return (
    <div
      className={`relative rounded-full shrink-0 flex items-center justify-center font-bold font-mono select-none bg-linear-to-br ${palette} ${sizeClass} ${borderClass} ${className}`}
      title={name}
      aria-label={name}
    >
      <span>{initials}</span>
    </div>
  );
}

export default UserAvatar;
