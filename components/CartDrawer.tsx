'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (!isCartOpen) return null;

  const shipping = totalPrice >= 50 || totalPrice === 0 ? 0 : 10;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in-50"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Shopping Cart</h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">Your cart is empty</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-xs">
                  Looks like you haven&apos;t added any tech essentials yet.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-slate-100 p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setIsCartOpen(false)}
                        className="font-semibold text-sm text-slate-900 hover:text-indigo-600 line-clamp-1 dark:text-white"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                  <span>Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all active:scale-[0.99]"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
