// app/logout/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function LogoutPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return <div>Logging out... (token: {token})</div>;
}
