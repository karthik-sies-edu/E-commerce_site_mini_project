import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, price, stockQuantity, imageUrl, categoryId } = body;

    if (!name || !description || price === undefined || stockQuantity === undefined || !imageUrl || !categoryId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Generate slug if omitted or empty
    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug: generatedSlug },
    });

    const finalSlug = existing ? `${generatedSlug}-${Date.now()}` : generatedSlug;

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity, 10),
        imageUrl: imageUrl.trim(),
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
