import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to complete checkout' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart contains no items' },
        { status: 400 }
      );
    }

    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a valid shipping address' },
        { status: 400 }
      );
    }

    // Execute atomic checkout transaction in Prisma
    const newOrder = await prisma.$transaction(async (tx) => {
      let computedTotal = 0;
      const orderItemsToCreate: Array<{
        productId: string;
        quantity: number;
        priceAtPurchase: number;
      }> = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.name || item.id}`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
          );
        }

        const price = Number(product.price);
        computedTotal += price * item.quantity;

        orderItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: price,
        });

        // Decrement product stock safely
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Add shipping if under $50
      const shippingCost = computedTotal >= 50 ? 0 : 10;
      const finalTotal = computedTotal + shippingCost;

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount: finalTotal,
          status: OrderStatus.PAID, // simulate immediate payment
          shippingAddress: shippingAddress.trim(),
          orderItems: {
            create: orderItemsToCreate,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return createdOrder;
    });

    return NextResponse.json(
      {
        message: 'Order placed successfully',
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process order' },
      { status: 400 }
    );
  }
}
