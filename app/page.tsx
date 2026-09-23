import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Sparkles, SlidersHorizontal, PackageX } from 'lucide-react';

interface HomePageProps {
  searchParams?: {
    category?: string;
    search?: string;
    sort?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: HomePageProps) {
  const categorySlug = searchParams?.category;
  const search = searchParams?.search;
  const sort = searchParams?.sort || 'newest';

  // Fetch categories for filtering
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  // Build where filter
  const where: any = {};
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-low') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-high') {
    orderBy = { price: 'desc' };
  } else if (sort === 'name') {
    orderBy = { name: 'asc' };
  }

  // Query products
  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
    },
  });

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-slate-900 py-20 text-white lg:py-28">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Next-Gen Desk Ergonomics & Hardware</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Crafted for Speed, <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Engineered for Focus.
                </span>
              </h1>

              <p className="max-w-xl text-base text-slate-300 sm:text-lg leading-relaxed">
                Elevate your daily workstation with tactile mechanical keyboards, studio-grade spatial audio, and architectural desk accessories.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:gap-3"
                >
                  Explore Catalog
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/?category=electronics"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all backdrop-blur-sm"
                >
                  View Electronics
                </Link>
              </div>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
                <div>
                  <div className="text-2xl font-extrabold text-white">40k+</div>
                  <div className="text-xs text-slate-400">Happy Creators</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">4.9/5</div>
                  <div className="text-xs text-slate-400">Customer Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">100%</div>
                  <div className="text-xs text-slate-400">Authentic Gear</div>
                </div>
              </div>
            </div>

            {/* Hero Showcase Image */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-700/50 shadow-2xl bg-slate-800">
                <Image
                  src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Minimalist Workspace"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Featured Setup</span>
                  <h3 className="text-xl font-bold text-white">The Precision Series 2026</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {categorySlug
                ? categories.find((c) => c.slug === categorySlug)?.name || 'Category Products'
                : search
                ? `Results for "${search}"`
                : 'Featured Collection'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {products.length} {products.length === 1 ? 'item' : 'items'} in our catalog
            </p>
          </div>

          {/* Sort Dropdown & Quick Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Sort:
            </span>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-medium">
              <Link
                href={`/?${new URLSearchParams({
                  ...(categorySlug ? { category: categorySlug } : {}),
                  ...(search ? { search } : {}),
                  sort: 'newest',
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sort === 'newest'
                    ? 'bg-white text-indigo-600 shadow-sm font-bold dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Newest
              </Link>
              <Link
                href={`/?${new URLSearchParams({
                  ...(categorySlug ? { category: categorySlug } : {}),
                  ...(search ? { search } : {}),
                  sort: 'price-low',
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sort === 'price-low'
                    ? 'bg-white text-indigo-600 shadow-sm font-bold dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/?${new URLSearchParams({
                  ...(categorySlug ? { category: categorySlug } : {}),
                  ...(search ? { search } : {}),
                  sort: 'price-high',
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sort === 'price-high'
                    ? 'bg-white text-indigo-600 shadow-sm font-bold dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              !categorySlug
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            All Items
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}${sort ? `&sort=${sort}` : ''}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                categorySlug === cat.slug
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <PackageX className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No products found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              We couldn&apos;t find any items matching your selected criteria. Try resetting filters or using different keywords.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              Clear All Filters
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price.toString()}
                stockQuantity={product.stockQuantity}
                imageUrl={product.imageUrl}
                categoryName={product.category.name}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
