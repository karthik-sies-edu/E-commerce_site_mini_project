'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  stockQuantity: number;
  imageUrl: string;
  categoryName?: string;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  stockQuantity,
  imageUrl,
  categoryName,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [addedRecently, setAddedRecently] = useState(false);

  const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const success = addToCart({
      id,
      name,
      slug,
      price: numericPrice,
      imageUrl,
      stockQuantity,
    });

    if (success) {
      setAddedRecently(true);
      setTimeout(() => setAddedRecently(false), 1500);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-none dark:hover:border-slate-700">
      {/* Product Image Thumbnail */}
      <Link href={`/product/${slug}`} className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Stock Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {categoryName && (
            <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700 shadow-sm dark:bg-slate-900/90 dark:text-slate-300">
              {categoryName}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="rounded-full bg-red-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              Only {stockQuantity} left
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              In Stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/product/${slug}`}>
            <h3 className="font-bold text-base text-slate-900 hover:text-indigo-600 line-clamp-1 transition-colors dark:text-white dark:hover:text-indigo-400">
              {name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
            Fast dispatch available
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Price</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              ${numericPrice.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              isOutOfStock
                ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                : addedRecently
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95'
            }`}
          >
            {addedRecently ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
