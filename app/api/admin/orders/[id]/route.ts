import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

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
    const { status } = body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid values: ${Object.values(OrderStatus).join(', ')}` },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { fullName: true, email: true } },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}
