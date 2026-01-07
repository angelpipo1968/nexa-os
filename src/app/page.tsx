'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir inmediatamente a español
    router.replace('/es');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="animate-pulse text-emerald-500 font-mono text-xl">
        INITIALIZING NEXA OS...
      </div>
    </div>
  );
}
