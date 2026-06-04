'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userParam);
      router.push('/dashboard');
    } else if (token || userParam) {
      router.push('/login');
    } else {
      router.push('/logout');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Logging you in...</div>
    </div>
  );
}