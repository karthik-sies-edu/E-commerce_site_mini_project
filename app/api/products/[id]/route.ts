import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const { name, description, price, stockQuantity, imageUrl, categoryId } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (stockQuantity !== undefined) dataToUpdate.stockQuantity = parseInt(stockQuantity, 10);
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl.trim();
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = params;

    // Check if product is in any past orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // If referenced in order history, we can either prevent deletion or mark stock as 0
      return NextResponse.json(
        {
          error:
            'This product cannot be permanently removed because it is part of existing customer order records. Consider setting its stock to 0 instead.',
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
