'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, ShieldAlert, UserCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const urlMessage = searchParams?.get('message');
  const isUnauthorized = searchParams?.get('error') === 'unauthorized';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(
    isUnauthorized ? 'Access denied. You need Administrator privileges to view that area.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-md">
            ⚡
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to manage orders, access checkout, or enter the admin suite
          </p>
        </div>

        {urlMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {urlMessage}
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Logins Banner */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
            Quick Demo Autofill
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin@store.com', 'Admin@123456')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 transition-colors"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('customer@store.com', 'Customer@123456')}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Customer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-500 dark:border-slate-800">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Sign Up here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
