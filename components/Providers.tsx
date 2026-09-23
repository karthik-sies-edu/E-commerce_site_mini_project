'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
