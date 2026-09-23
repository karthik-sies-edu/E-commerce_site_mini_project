'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number | string;
  product: {
    name: string;
    imageUrl: string;
    slug: string;
  };
}

interface Order {
  id: string;
  totalAmount: number | string;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
  orderItems: OrderItem[];
}

interface OrderManagementClientProps {
  initialOrders: Order[];
}

export default function OrderManagementClient({ initialOrders }: OrderManagementClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            <Clock className="h-3 w-3" /> Paid
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            <Truck className="h-3 w-3" /> Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Customer Orders Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Track fulfillment states, update order status, and inspect package contents
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total orders: <span className="font-bold text-slate-900 dark:text-white">{orders.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by customer name, email, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 text-xs font-semibold">
          <Filter className="h-3.5 w-3.5 ml-2 mr-1 text-slate-400" />
          {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Order ID & Date</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold">Current Status</th>
                <th className="py-3.5 px-4 font-semibold">Update Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <React.Fragment key={ord.id}>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          #{ord.id.slice(0, 8)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {ord.user.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">{ord.user.email}</div>
                      </td>

                      <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                        ${Number(ord.totalAmount).toFixed(2)}
                      </td>

                      <td className="py-4 px-4">{getStatusBadge(ord.status)}</td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={ord.status}
                            disabled={updatingId === ord.id}
                            onChange={(e) =>
                              handleStatusChange(ord.id, e.target.value as OrderStatus)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                          {updatingId === ord.id && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === ord.id ? null : ord.id)
                          }
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          {expandedId === ord.id ? (
                            <>
                              Hide <ChevronUp className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              View ({ord.orderItems.length}) <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Order Items Row */}
                    {expandedId === ord.id && (
                      <tr className="bg-slate-50/70 dark:bg-slate-800/30">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-3">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Shipping Destination:
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                {ord.shippingAddress}
                              </p>
                            </div>

                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Purchased Items:
                            </span>
                            <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                              {ord.orderItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                      <Image
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 dark:text-white">
                                        {item.product.name}
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        Qty: {item.quantity} &times; ${Number(item.priceAtPurchase).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="font-extrabold text-slate-900 dark:text-white">
                                    ${(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
