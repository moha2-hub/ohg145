// /app/logout/page.tsx
import { Suspense } from 'react';
import LogoutClient from './logoutclient';

export default function LogoutPage() {
  return (
    <Suspense fallback={<p>Logging out...</p>}>
      <LogoutClient />
    </Suspense>
  );
}
