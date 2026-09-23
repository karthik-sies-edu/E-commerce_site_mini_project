import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductDetailClient from '@/components/ProductDetailClient';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) {
    return {
      title: 'Product Not Found | NEXUS STORE',
    };
  }

  return {
    title: `${product.name} | NEXUS STORE`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-8">
        <Link href="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link
          href={`/?category=${product.category.slug}`}
          className="hover:text-indigo-600 transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
        {/* Gallery / Image Column */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Catalog
          </Link>
        </div>

        {/* Product Details & Purchase Controls */}
        <div className="space-y-8">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {product.category.name}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              {product.name}
            </h1>
          </div>

          {/* Description */}
          <div className="prose prose-slate dark:prose-invert">
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Interactive Pricing, Stock & Add to Cart Client Component */}
          <ProductDetailClient
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price.toString(),
              stockQuantity: product.stockQuantity,
              imageUrl: product.imageUrl,
              description: product.description,
            }}
          />
        </div>
      </div>
    </div>
  );
}
