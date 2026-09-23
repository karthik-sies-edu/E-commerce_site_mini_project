import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Boxes,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Aggregate revenue
  const revenueAgg = await prisma.order.aggregate({
    where: {
      status: {
        in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      },
    },
    _sum: {
      totalAmount: true,
    },
  });
  const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);

  // Total orders
  const totalOrders = await prisma.order.count();

  // Total users
  const totalUsers = await prisma.user.count();

  // Low stock products count
  const lowStockCount = await prisma.product.count({
    where: {
      stockQuantity: {
        lte: 5,
      },
    },
  });

  // Recent 5 orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, email: true } },
      orderItems: true,
    },
  });

  // Low stock items list
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stockQuantity: {
        lte: 5,
      },
    },
    take: 5,
    include: { category: true },
  });

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Executive Analytics Overview
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time PostgreSQL metrics for revenue, inventory health, and customer purchases
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors"
          >
            <Boxes className="h-4 w-4" />
            Manage Products
          </Link>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Settled & in-transit orders</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalOrders}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Lifetime customer checkouts
            </div>
          </div>
        </div>

        {/* Total Registered Users */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Users
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalUsers}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Registered customers & admins
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Low Stock Alerts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {lowStockCount}
            </div>
            <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Items with &le; 5 units remaining
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Orders
              </h2>
              <p className="text-xs text-slate-400">Latest customer transactions</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View All Orders
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {ord.user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">{ord.user.email}</div>
                      </td>
                      <td className="py-3.5 font-medium text-slate-600 dark:text-slate-300">
                        {ord.orderItems.length} items
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        ${Number(ord.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Inventory Alerts
              </h2>
              <p className="text-xs text-slate-400">Products needing restock</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Restock
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-600 font-semibold flex flex-col items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                All inventory levels are healthy!
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-white dark:bg-slate-800">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate dark:text-white">
                      {p.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">{p.category.name}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.stockQuantity === 0
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {p.stockQuantity} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
