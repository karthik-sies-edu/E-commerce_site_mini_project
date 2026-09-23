import React from 'react';
import prisma from '@/lib/prisma';
import OrderManagementClient from '@/components/admin/OrderManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  // Serialize Decimals and Dates for Client Component
  const serializedOrders = orders.map((o) => ({
    id: o.id,
    totalAmount: Number(o.totalAmount),
    status: o.status,
    shippingAddress: o.shippingAddress,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
    orderItems: o.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      priceAtPurchase: Number(item.priceAtPurchase),
      product: item.product,
    })),
  }));

  return <OrderManagementClient initialOrders={serializedOrders} />;
}
