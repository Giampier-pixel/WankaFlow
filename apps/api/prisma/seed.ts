// prisma/seed.ts
import { PrismaClient, UserRole, ProductStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123456', 12)
  const userPassword = await bcrypt.hash('user123456', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wankaflow.com' },
    update: {},
    create: {
      email: 'admin@wankaflow.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
  })

  const wholesaleUser = await prisma.user.upsert({
    where: { email: 'wholesale@example.com' },
    update: {},
    create: {
      email: 'wholesale@example.com',
      password: userPassword,
      name: 'Carlos Mendoza',
      role: UserRole.WHOLESALE,
      status: 'ACTIVE',
      businessName: 'Distribuidora Mendoza SAC',
      creditLimit: 10000,
    },
  })

  const retailUser = await prisma.user.upsert({
    where: { email: 'retail@example.com' },
    update: {},
    create: {
      email: 'retail@example.com',
      password: userPassword,
      name: 'Ana García',
      role: UserRole.RETAIL,
      status: 'ACTIVE',
    },
  })

  const pendingWholesale = await prisma.user.upsert({
    where: { email: 'pending@example.com' },
    update: {},
    create: {
      email: 'pending@example.com',
      password: userPassword,
      name: 'Roberto Silva',
      role: UserRole.WHOLESALE,
      status: 'PENDING',
      businessName: 'Importaciones Silva EIRL',
    },
  })

  console.log('✅ Users created')

  // ── Categories ─────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics', icon: 'lucide:smartphone' },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: { name: 'Clothing', slug: 'clothing', icon: 'lucide:shirt' },
    }),
    prisma.category.upsert({
      where: { slug: 'home-garden' },
      update: {},
      create: { name: 'Home & Garden', slug: 'home-garden', icon: 'lucide:home' },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: { name: 'Sports', slug: 'sports', icon: 'lucide:dumbbell' },
    }),
    prisma.category.upsert({
      where: { slug: 'beauty' },
      update: {},
      create: { name: 'Beauty', slug: 'beauty', icon: 'lucide:sparkles' },
    }),
    prisma.category.upsert({
      where: { slug: 'toys' },
      update: {},
      create: { name: 'Toys', slug: 'toys', icon: 'lucide:gamepad-2' },
    }),
  ])

  console.log('✅ Categories created')

  // ── Products ───────────────────────────────────────────────────────────────
  const productsData = [
    {
      name: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      sku: 'WBH-001',
      description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life.',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
      brand: 'AudioTech',
      categorySlug: 'electronics',
      retailPrice: 149.99,
      wholesalePrice: 89.99,
      stock: 245,
      minStock: 20,
      warehouseLocation: 'A-12-3',
      volumePricing: [
        { minQty: 1, maxQty: 9, price: 89.99 },
        { minQty: 10, maxQty: 49, price: 79.99 },
        { minQty: 50, maxQty: null, price: 69.99 },
      ],
    },
    {
      name: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      sku: 'SFW-002',
      description: 'Track health and fitness with heart rate monitoring, GPS, and 7-day battery life.',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
      brand: 'FitPro',
      categorySlug: 'electronics',
      retailPrice: 299.99,
      wholesalePrice: 179.99,
      stock: 89,
      minStock: 15,
      warehouseLocation: 'A-15-1',
      volumePricing: [
        { minQty: 1, maxQty: 9, price: 179.99 },
        { minQty: 10, maxQty: 49, price: 159.99 },
        { minQty: 50, maxQty: null, price: 139.99 },
      ],
    },
    {
      name: 'Premium Running Shoes',
      slug: 'premium-running-shoes',
      sku: 'PRS-003',
      description: 'Professional running shoes with advanced cushioning and breathable mesh.',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
      brand: 'RunPeak',
      categorySlug: 'sports',
      retailPrice: 129.99,
      wholesalePrice: 74.99,
      stock: 8,
      minStock: 25,
      warehouseLocation: 'B-03-2',
      volumePricing: [
        { minQty: 1, maxQty: 11, price: 74.99 },
        { minQty: 12, maxQty: null, price: 64.99 },
      ],
    },
    {
      name: 'Organic Face Serum',
      slug: 'organic-face-serum',
      sku: 'OFS-004',
      description: '100% organic vitamin C serum with hyaluronic acid for radiant skin.',
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'],
      brand: 'NaturGlow',
      categorySlug: 'beauty',
      retailPrice: 59.99,
      wholesalePrice: 34.99,
      stock: 156,
      minStock: 30,
      warehouseLocation: 'C-07-4',
      volumePricing: [
        { minQty: 1, maxQty: 23, price: 34.99 },
        { minQty: 24, maxQty: null, price: 28.99 },
      ],
    },
    {
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      sku: 'EOC-005',
      description: 'Fully adjustable ergonomic chair with lumbar support and breathable mesh back.',
      images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600'],
      brand: 'ComfortWork',
      categorySlug: 'home-garden',
      retailPrice: 449.99,
      wholesalePrice: 279.99,
      stock: 34,
      minStock: 5,
      warehouseLocation: 'D-01-1',
      volumePricing: [
        { minQty: 1, maxQty: 4, price: 279.99 },
        { minQty: 5, maxQty: null, price: 249.99 },
      ],
    },
    {
      name: 'Kids Building Blocks Set',
      slug: 'kids-building-blocks-set',
      sku: 'KBB-006',
      description: 'Creative building blocks set with 500 pieces, safe for children 3+.',
      images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600'],
      brand: 'PlayBuilders',
      categorySlug: 'toys',
      retailPrice: 39.99,
      wholesalePrice: 22.99,
      stock: 0,
      minStock: 50,
      warehouseLocation: 'E-09-3',
      volumePricing: [
        { minQty: 1, maxQty: 11, price: 22.99 },
        { minQty: 12, maxQty: null, price: 18.99 },
      ],
    },
  ]

  for (const p of productsData) {
    const category = categories.find(c => c.slug === p.categorySlug)
    const { categorySlug, volumePricing, ...productData } = p

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        categoryId: category.id,
        status: ProductStatus.ACTIVE,
        volumePricing: { create: volumePricing },
      },
    })
  }

  console.log('✅ Products created')

  // ── Coupon ─────────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: '10% off for new customers',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 50,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'WHOLESALE50' },
    update: {},
    create: {
      code: 'WHOLESALE50',
      description: '$50 off for wholesale orders over $500',
      discountType: 'fixed',
      discountValue: 50,
      minOrderAmount: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      appliesToRole: UserRole.WHOLESALE,
    },
  })

  console.log('✅ Coupons created')

  console.log('\n🎉 Seed complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Admin:     admin@wankaflow.com / admin123456')
  console.log('🏢 Wholesale: wholesale@example.com / user123456')
  console.log('🛒 Retail:    retail@example.com / user123456')
  console.log('⏳ Pending:   pending@example.com / user123456')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
