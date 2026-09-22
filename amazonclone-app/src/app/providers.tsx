'use client';
// ============================================================================
// Providers — wraps the app with all React context providers
// This is a Client Component boundary so contexts can use browser APIs.
// ============================================================================
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { LocationProvider } from '@/context/LocationContext';
import { LocationModal } from '@/components/layout/LocationModal';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <LocationProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <LocationModal />
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

