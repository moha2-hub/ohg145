// /app/logout/LogoutClient.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LogoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch('/api/logout', { method: 'POST' })
      .then(async res => {
        if (!res.ok) {
          // Optionally handle error
          router.push('/login')
          return
        }
        const text = await res.text()
        if (!text) {
          router.push('/login')
          return
        }
        try {
          JSON.parse(text)
        } catch (e) {
          // Not valid JSON, but still log out
        }
        router.push('/login')
      })
      .catch(() => router.push('/login'))
  }, [])

  return <p>Logging out...</p>;
}
