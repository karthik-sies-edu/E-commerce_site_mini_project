'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldAlert, User, Loader2, ArrowUpDown } from 'lucide-react';
import { Role } from '@prisma/client';

interface UserItem {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
  _count: {
    orders: number;
  };
}

interface UserManagementClientProps {
  initialUsers: UserItem[];
  currentUserId?: string;
}

export default function UserManagementClient({
  initialUsers,
  currentUserId,
}: UserManagementClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleRole = async (user: UserItem) => {
    const nextRole: Role = user.role === Role.ADMIN ? Role.USER : Role.ADMIN;

    if (user.id === currentUserId && nextRole !== Role.ADMIN) {
      alert('You cannot revoke your own administrator role.');
      return;
    }

    const confirmMsg = `Are you sure you want to change ${user.fullName}'s role from ${user.role} to ${nextRole}?`;
    if (!confirm(confirmMsg)) return;

    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user role');

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            User Management & RBAC
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            View registered user profiles, track customer orders, and grant or revoke Administrator rights
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Users: <span className="font-bold text-slate-900 dark:text-white">{users.length}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-3.5 px-6 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Current Role</th>
                <th className="py-3.5 px-4 font-semibold">Orders Count</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-6 font-semibold text-right">Role Toggle Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUserId;
                  const isAdmin = u.role === Role.ADMIN;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs ${
                              isAdmin
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {u.fullName[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {u.fullName}
                              {isCurrent && (
                                <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                            <ShieldAlert className="h-3 w-3" /> ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <User className="h-3 w-3 text-slate-400" /> USER
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        {u._count.orders} {u._count.orders === 1 ? 'order' : 'orders'}
                      </td>

                      <td className="py-4 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={updatingId === u.id || (isCurrent && isAdmin)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            isAdmin
                              ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {updatingId === u.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                          {isAdmin ? 'Demote to USER' : 'Promote to ADMIN'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
