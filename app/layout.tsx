import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NEXUS STORE | Precision Hardware & Workspace Equipment',
  description:
    'Discover premium mechanical keyboards, ergonomic audio gear, titanium smartwatches, and minimalist desk setups engineered for modern creators.',
  keywords: ['mechanical keyboard', 'ergonomic workspace', 'smart accessories', 'minimalist desk', 'tech gear'],
  authors: [{ name: 'NEXUS STORE' }],
  openGraph: {
    title: 'NEXUS STORE | Modern E-Commerce',
    description: 'High-performance workspace gear and accessories.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        <Providers>
          <Suspense fallback={<div className="h-16 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" />}>
            <Navbar />
          </Suspense>
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
