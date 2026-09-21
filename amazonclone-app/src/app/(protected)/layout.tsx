'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDedicatedPortal = pathname?.startsWith('/seller') || pathname?.startsWith('/admin');

  if (isDedicatedPortal) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
