'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Users,
  Store,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Analytics Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Product Catalog', href: '/admin/products', icon: Boxes },
  { name: 'Customer Orders', href: '/admin/orders', icon: ClipboardList },
  { name: 'User Management', href: '/admin/users', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-md">
            ⚡
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block">
              NEXUS ADMIN
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-3 w-3" /> Management Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <Store className="h-4 w-4 text-slate-400" />
          Back to Storefront
        </Link>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {session?.user?.name || 'Administrator'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {session?.user?.email}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-2.5 flex w-full items-center gap-1.5 rounded-lg text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
