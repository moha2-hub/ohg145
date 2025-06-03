// /app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Example: Perform logout logic, then redirect
    // You can also read query params: searchParams.get('someKey')

    // You could call an API route to log out, then redirect
    fetch('/api/logout', { method: 'POST' }).finally(() => {
      router.push('/login');
    });
  }, []);

  return <p>Logging out...</p>;
}
