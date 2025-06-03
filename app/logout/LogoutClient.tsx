// /app/logout/LogoutClient.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LogoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch('/api/logout', { method: 'POST' }).finally(() => {
      router.push('/login');
    });
  }, []);

  return <p>Logging out...</p>;
}
