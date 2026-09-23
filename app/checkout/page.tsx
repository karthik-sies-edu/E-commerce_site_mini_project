'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart, updateQuantity, removeFromCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: session?.user?.name || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const shippingCost = totalPrice >= 50 || totalPrice === 0 ? 0 : 10;
  const grandTotal = totalPrice + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!session?.user) {
      router.push('/login?callbackUrl=/checkout');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }

    const fullAddress = `${formData.fullName}, ${formData.street}, ${formData.city}, ${formData.state} ${formData.postalCode}. Phone: ${formData.phone}`;

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: fullAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      setCompletedOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while processing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Success Screen
  if (completedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your transaction has been securely processed and written to PostgreSQL.
          </p>

          <div className="mt-6 inline-block rounded-2xl bg-slate-50 px-4 py-2 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Order ID: <span className="font-bold text-indigo-600 dark:text-indigo-400">{completedOrder.id}</span>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-100 p-6 text-left dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delivery Summary</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {completedOrder.shippingAddress}
            </p>
            <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 text-sm font-bold dark:border-slate-700">
              <span>Total Paid:</span>
              <span className="text-indigo-600 dark:text-indigo-400">${Number(completedOrder.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-md transition-colors"
            >
              View Order History
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Storefront
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8">
        Secure Checkout
      </h1>

      {/* Unauthenticated Alert */}
      {status === 'unauthenticated' && (
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <span className="text-sm font-medium">
              You are currently browsing as a guest. Please sign in to finalize your purchase.
            </span>
          </div>
          <Link
            href="/login?callbackUrl=/checkout"
            className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Shipping Information Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <Truck className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Shipping Address</h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="123 Silicon Boulevard, Suite 100"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="San Francisco"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    State / Region
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="CA"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="94107"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Payment simulation notice */}
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  <span>Test Payment Method: Instant Simulated Card</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  In demo mode, completing checkout simulates payment confirmation immediately and marks your order as PAID.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing Database Transaction...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Place Order (${grandTotal.toFixed(2)})
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-4 dark:border-slate-800">
              Order Summary ({items.length})
            </h3>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Your cart is empty.</p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white ml-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard Delivery</span>
                <span className="font-semibold text-emerald-600">
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                <span>Total Due</span>
                <span className="text-indigo-600 dark:text-indigo-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/40">
              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>256-bit encrypted checkout with PostgreSQL transactional safety</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
