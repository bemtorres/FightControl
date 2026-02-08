'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
    </div>
  );
}
