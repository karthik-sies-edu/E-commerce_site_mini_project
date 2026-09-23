'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check, Plus, Minus, Zap, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    stockQuantity: number;
    imageUrl: string;
    description: string;
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedRecently, setAddedRecently] = useState(false);

  const numericPrice = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleIncrement = () => {
    if (quantity < product.stockQuantity) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const success = addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: numericPrice,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
      },
      quantity
    );

    if (success) {
      setAddedRecently(true);
      setTimeout(() => setAddedRecently(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: numericPrice,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
      },
      quantity
    );
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      {/* Price & Stock Display */}
      <div className="flex items-baseline gap-4">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
          ${numericPrice.toFixed(2)}
        </span>
        <span className="text-xs text-slate-400">Taxes calculated at checkout</span>
      </div>

      {/* Live Stock Notification */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500">Availability:</span>
          {isOutOfStock ? (
            <span className="font-bold text-red-600">Currently Sold Out</span>
          ) : product.stockQuantity <= 5 ? (
            <span className="font-bold text-amber-600">Only {product.stockQuantity} units left in stock!</span>
          ) : (
            <span className="font-bold text-emerald-600">{product.stockQuantity} units in stock & ready to ship</span>
          )}
        </div>
      </div>

      {/* Quantity Selector & Actions */}
      {!isOutOfStock && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity:</span>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.stockQuantity}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-slate-400">
              Subtotal: <span className="font-bold text-slate-700 dark:text-slate-200">${(numericPrice * quantity).toFixed(2)}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold shadow-lg transition-all ${
                addedRecently
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/25 active:scale-98'
              }`}
            >
              {addedRecently ? (
                <>
                  <Check className="h-5 w-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-600 bg-transparent py-3.5 px-6 text-sm font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all active:scale-98"
            >
              <Zap className="h-4 w-4" />
              Instant Checkout
            </button>
          </div>
        </div>
      )}

      {/* Feature bullet badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-indigo-500" />
          <span>Next-day dispatch</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          <span>Official 2-yr warranty</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-indigo-500" />
          <span>30-day money-back</span>
        </div>
      </div>
    </div>
  );
}
