import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { role } = body;

    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Allowed values: ${Object.values(Role).join(', ')}` },
        { status: 400 }
      );
    }

    // Prevent admin from accidentally demoting themselves
    if (session.user.id === id && role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'You cannot revoke your own administrator privileges.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}
