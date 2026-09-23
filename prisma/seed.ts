import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in correct order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const userPasswordHash = await bcrypt.hash('Customer@123456', 10);

  // 3. Create Admin & User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@store.com',
      passwordHash: adminPasswordHash,
      fullName: 'Store Administrator',
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@store.com',
      passwordHash: userPasswordHash,
      fullName: 'Jane Doe',
      role: Role.USER,
    },
  });

  console.log('✅ Created users: admin@store.com and customer@store.com');

  // 4. Create Categories
  const categoriesData = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Audio & Wearables', slug: 'audio-wearables' },
    { name: 'Home & Office', slug: 'home-office' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log('✅ Created 4 categories');

  // 5. Create Products
  const productsData = [
    {
      name: 'UltraSlim Mechanical Keyboard',
      slug: 'ultraslim-mechanical-keyboard',
      description: 'Engineered for tactile feedback and speed with low-profile optical switches, RGB backlighting, and Bluetooth 5.2 connectivity.',
      price: 129.99,
      stockQuantity: 45,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['electronics'],
    },
    {
      name: 'Precision Wireless Ergonomic Mouse',
      slug: 'precision-wireless-ergonomic-mouse',
      description: 'Contoured design for all-day comfort, multi-device hyper-fast scroll wheel, and a 4,000 DPI Darkfield sensor that tracks anywhere.',
      price: 89.50,
      stockQuantity: 32,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['electronics'],
    },
    {
      name: 'Studio Pro Noise-Cancelling Headphones',
      slug: 'studio-pro-noise-cancelling-headphones',
      description: 'Industry-leading active noise cancellation, custom 40mm drivers for spatial audio, and up to 40 hours of playtime per charge.',
      price: 279.00,
      stockQuantity: 18,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['audio-wearables'],
    },
    {
      name: 'True Wireless Sport Earbuds',
      slug: 'true-wireless-sport-earbuds',
      description: 'IPX7 sweat and waterproof earbuds with secure-fit ear hooks, deep bass acoustics, and 30 hours of combined battery life.',
      price: 99.99,
      stockQuantity: 60,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['audio-wearables'],
    },
    {
      name: 'Titanium Smart Watch Gen 4',
      slug: 'titanium-smart-watch-gen-4',
      description: 'Always-On AMOLED sapphire display, comprehensive health analytics (ECG, SpO2, stress monitoring), and 5ATM water resistance.',
      price: 249.99,
      stockQuantity: 4, // low stock test
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['audio-wearables'],
    },
    {
      name: 'Minimalist Aluminum Laptop Stand',
      slug: 'minimalist-aluminum-laptop-stand',
      description: 'Crafted from aircraft-grade aluminum alloy, elevating your screen by 6 inches for ergonomic neck alignment and superior airflow.',
      price: 49.99,
      stockQuantity: 80,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['home-office'],
    },
    {
      name: '4K Ultra-Wide Curved Monitor 34"',
      slug: '4k-ultrawide-curved-monitor-34',
      description: 'Immersive 1500R curvature, 144Hz refresh rate, HDR400, and USB-C 90W power delivery for the ultimate multitasking workstation.',
      price: 599.00,
      stockQuantity: 2, // low stock alert test
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['electronics'],
    },
    {
      name: 'Full-Grain Leather Desk Mat',
      slug: 'full-grain-leather-desk-mat',
      description: 'Premium water-resistant vegetable-tanned leather desk pad providing an ultra-smooth glide for mouse movements and desk protection.',
      price: 54.00,
      stockQuantity: 25,
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['accessories'],
    },
    {
      name: 'Braided Fast Charging Cable (2M)',
      slug: 'braided-fast-charging-cable-2m',
      description: 'Durable nylon-braided USB-C to USB-C 100W Power Delivery cable with reinforced aluminum connectors tested to 30,000+ bends.',
      price: 19.99,
      stockQuantity: 120,
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      categoryId: categories['accessories'],
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }
  console.log(`✅ Created ${createdProducts.length} products`);

  // 6. Create Sample Orders for customer
  const sampleOrder1 = await prisma.order.create({
    data: {
      userId: customer.id,
      totalAmount: 368.99,
      status: OrderStatus.PAID,
      shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
      orderItems: {
        create: [
          {
            productId: createdProducts[0].id, // Keyboard
            quantity: 1,
            priceAtPurchase: 129.99,
          },
          {
            productId: createdProducts[1].id, // Mouse
            quantity: 1,
            priceAtPurchase: 89.50,
          },
          {
            productId: createdProducts[7].id, // Desk mat
            quantity: 1,
            priceAtPurchase: 54.00,
          },
        ],
      },
    },
  });

  const sampleOrder2 = await prisma.order.create({
    data: {
      userId: customer.id,
      totalAmount: 279.00,
      status: OrderStatus.SHIPPED,
      shippingAddress: '100 Main Street, Suite 400, New York, NY 10001',
      orderItems: {
        create: [
          {
            productId: createdProducts[2].id, // Headphones
            quantity: 1,
            priceAtPurchase: 279.00,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample orders for customer analytics');
  console.log('🚀 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
