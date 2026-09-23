import React from 'react';
import prisma from '@/lib/prisma';
import ProductManagementClient from '@/components/admin/ProductManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  // Serialize Prisma Decimals and Dates for Client Component
  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <ProductManagementClient
      initialProducts={serializedProducts}
      categories={categories}
    />
  );
}
