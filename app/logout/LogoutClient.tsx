// /app/logout/logout-client.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LogoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // You could call an API route to log out, then redirect
    fetch('/api/logout', { method: 'POST' }).finally(() => {
      router.push('/login');
    });
  }, []);

  return <p>Logging out...</p>;
}
