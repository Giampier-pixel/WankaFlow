// src/modules/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UserRole } from '@prisma/client'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }, userRole?: UserRole) {
    const {
      page = 1, limit = 20, search, category, status,
      minPrice, maxPrice, inStock, sortBy = 'createdAt', sortOrder = 'desc',
    } = query

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) where.category = { slug: category }
    if (status) where.status = status
    else if (!userRole || userRole === 'RETAIL') where.status = 'ACTIVE'

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.retailPrice = {}
      if (minPrice !== undefined) where.retailPrice.gte = minPrice
      if (maxPrice !== undefined) where.retailPrice.lte = maxPrice
    }

    if (inStock) where.stock = { gt: 0 }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          volumePricing: { orderBy: { minQty: 'asc' } },
          variants: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ])

    // Hide wholesale price for non-authenticated or RETAIL users
    const sanitized = items.map(p => this.sanitizeProduct(p, userRole))

    return {
      items: sanitized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findBySlug(slug: string, userRole?: UserRole) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        volumePricing: { orderBy: { minQty: 'asc' } },
        variants: true,
      },
    })

    if (!product) throw new NotFoundException(`Product not found: ${slug}`)

    return this.sanitizeProduct(product, userRole)
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        volumePricing: { orderBy: { minQty: 'asc' } },
        variants: true,
      },
    })
    if (!product) throw new NotFoundException(`Product not found`)
    return product
  }

  async create(dto: CreateProductDto) {
    const { volumePricing, variants, ...productData } = dto

    return this.prisma.product.create({
      data: {
        ...productData,
        volumePricing: volumePricing
          ? { create: volumePricing }
          : undefined,
        variants: variants
          ? { create: variants }
          : undefined,
      },
      include: { category: true, volumePricing: true, variants: true },
    })
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    await this.findById(id)
    const { volumePricing, variants, ...productData } = dto

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(volumePricing && {
          volumePricing: {
            deleteMany: {},
            create: volumePricing,
          },
        }),
        ...(variants && {
          variants: {
            deleteMany: {},
            create: variants,
          },
        }),
      },
      include: { category: true, volumePricing: true, variants: true },
    })
  }

  async remove(id: string) {
    await this.findById(id)
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })
  }

  async getPrice(productId: string, quantity: number, userRole: UserRole): Promise<number> {
    const product = await this.findById(productId)

    if (userRole === 'WHOLESALE') {
      // Check volume pricing first
      const volumeRule = product.volumePricing
        .sort((a, b) => b.minQty - a.minQty)
        .find(vp => quantity >= vp.minQty && (!vp.maxQty || quantity <= vp.maxQty))

      return volumeRule ? volumeRule.price : product.wholesalePrice
    }

    return product.retailPrice
  }

  private sanitizeProduct(product: any, userRole?: UserRole) {
    // Only WHOLESALE and ADMIN see the wholesale price
    if (!userRole || userRole === 'RETAIL') {
      const { wholesalePrice, ...rest } = product
      return { ...rest, wholesalePrice: null }
    }
    return product
  }
}
