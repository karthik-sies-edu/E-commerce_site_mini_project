'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Search,
  User,
  ShieldAlert,
  LogOut,
  Package,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { totalItems, setIsCartOpen } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Do not render storefront navbar within Admin portal
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`);
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-md group-hover:bg-indigo-700 transition-colors">
              ⚡
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              NEXUS<span className="text-indigo-600">STORE</span>
            </span>
          </Link>

          {/* Desktop Categories quick links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              All Products
            </Link>
            <Link href="/?category=electronics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Electronics
            </Link>
            <Link href="/?category=audio-wearables" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Audio
            </Link>
            <Link href="/?category=home-office" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Workspace
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search premium gear, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </form>

        {/* Right Actions: Cart & Auth */}
        <div className="flex items-center space-x-3">
          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="View Shopping Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Account / Auth */}
          {status === 'loading' ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          ) : session?.user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs dark:bg-indigo-950 dark:text-indigo-300">
                  {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{session.user.name || 'Account'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in-50 zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate dark:text-white">
                        {session.user.email}
                      </p>
                      {isAdmin && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Admin Role
                        </span>
                      )}
                    </div>

                    {/* Admin Dashboard Link (Only visible if ADMIN) */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Package className="h-4 w-4 text-slate-400" />
                      My Orders
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              All Products
            </Link>
            <Link
              href="/?category=electronics"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Electronics
            </Link>
            <Link
              href="/?category=audio-wearables"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Audio & Wearables
            </Link>
            <Link
              href="/?category=home-office"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Home & Office
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
              >
                ⚡ Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
