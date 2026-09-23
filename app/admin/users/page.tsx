import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import UserManagementClient from '@/components/admin/UserManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <UserManagementClient
      initialUsers={serializedUsers}
      currentUserId={session?.user?.id}
    />
  );
}
