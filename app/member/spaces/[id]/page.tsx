'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MemberSpaceDetailRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/spaces/${params.id}`);
    } else {
      router.replace('/spaces');
    }
  }, [params, router]);

  return (
    <div className="flex items-center justify-center py-20 text-zinc-400 text-xs font-mono">
      Mengalihkan ke Detail Ruang...
    </div>
  );
}
