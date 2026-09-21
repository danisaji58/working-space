'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MemberSpacesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/spaces');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-zinc-400 text-xs font-mono">
      Mengalihkan ke Katalog Ruang...
    </div>
  );
}
