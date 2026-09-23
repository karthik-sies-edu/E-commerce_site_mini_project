import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/?error=unauthorized');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
