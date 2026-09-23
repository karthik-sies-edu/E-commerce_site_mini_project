import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Package, ArrowLeft, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          <Clock className="h-3.5 w-3.5" />
          Paid & Processing
        </span>
      );
    case 'SHIPPED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
          <Truck className="h-3.5 w-3.5" />
          Shipped & In Transit
        </span>
      );
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle className="h-3.5 w-3.5" />
          Delivered
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
          <XCircle className="h-3.5 w-3.5" />
          Cancelled
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          <Clock className="h-3.5 w-3.5" />
          Pending Payment
        </span>
      );
  }
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Store
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          My Order History
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track current shipments and view previous receipts
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No orders placed yet</h3>
          <p className="mt-1 text-xs text-slate-500">Once you make a purchase, you can track it here.</p>
          <Link
            href="/"
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500">
                  <div>
                    <span className="block font-semibold uppercase tracking-wider text-slate-400">Date Placed</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase tracking-wider text-slate-400">Total Amount</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase tracking-wider text-slate-400">Order ID</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      {order.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Qty: {item.quantity} &times; ${Number(item.priceAtPurchase).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ${(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Delivered to: </span>
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
