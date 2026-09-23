'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Value propositions banner */}
      <div className="border-b border-slate-100 py-10 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Free Express Shipping</h4>
                <p className="text-xs text-slate-500">On all continental orders over $50</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">2-Year Warranty</h4>
                <p className="text-xs text-slate-500">Full replacement coverage guaranteed</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">30-Day Easy Returns</h4>
                <p className="text-xs text-slate-500">Hassle-free money-back policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">24/7 Priority Support</h4>
                <p className="text-xs text-slate-500">Direct dedicated tech assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
                ⚡
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                NEXUS<span className="text-indigo-600">STORE</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Curated precision hardware, ergonomic accessories, and next-generation workspace equipment built for creators and engineers.
            </p>
          </div>

          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Categories</h5>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><Link href="/?category=electronics" className="hover:text-indigo-600 transition-colors">Electronics & Hardware</Link></li>
              <li><Link href="/?category=audio-wearables" className="hover:text-indigo-600 transition-colors">Audio & Smart Wearables</Link></li>
              <li><Link href="/?category=home-office" className="hover:text-indigo-600 transition-colors">Ergonomic Office</Link></li>
              <li><Link href="/?category=accessories" className="hover:text-indigo-600 transition-colors">Premium Cables & Mats</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Account & Portal</h5>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><Link href="/login" className="hover:text-indigo-600 transition-colors">Customer Login</Link></li>
              <li><Link href="/signup" className="hover:text-indigo-600 transition-colors">Create Account</Link></li>
              <li><Link href="/orders" className="hover:text-indigo-600 transition-colors">Track Orders</Link></li>
              <li><Link href="/admin" className="hover:text-indigo-600 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Security & Trust</h5>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Protected by PostgreSQL relational integrity, NextAuth JWT cryptographic verification, and end-to-end encrypted sessions.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                SSL Secured
              </span>
              <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                PostgreSQL DB
              </span>
              <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Next.js 14
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-8 dark:border-slate-800 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} NEXUS STORE Inc. Built with Next.js App Router, Tailwind CSS, PostgreSQL, and Prisma.
        </div>
      </div>
    </footer>
  );
}
