// src/modules/orders/orders.service.ts
import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { ProductsService } from '../products/products.service'
import { EventsGateway } from '../websockets/events.gateway'
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto'
import { UserRole } from '@prisma/client'

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(query: {
    page?: number
    limit?: number
    status?: string
    customerId?: string
    paymentMethod?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const { page = 1, limit = 20, status, customerId, paymentMethod, dateFrom, dateTo } = query

    const where: any = {}
    if (status) where.status = status
    if (customerId) where.customerId = customerId
    if (paymentMethod) where.paymentMethod = paymentMethod
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, role: true } },
          items: true,
          payment: true,
          shippingAddress: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: { select: { id: true, name: true, images: true, sku: true } } } },
        payment: true,
        shippingAddress: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!order) throw new NotFoundException('Order not found')

    // Non-admins can only see their own orders
    if (userRole !== 'ADMIN' && order.customerId !== userId) {
      throw new ForbiddenException('Access denied')
    }

    return order
  }

  async create(dto: CreateOrderDto, userId: string, userRole: UserRole) {
    // 1. Validate products & calculate prices
    const orderItems = await Promise.all(
      dto.items.map(async item => {
        const product = await this.productsService.findById(item.productId)

        if (product.status !== 'ACTIVE') {
          throw new BadRequestException(`Product ${product.name} is not available`)
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          )
        }

        const unitPrice = await this.productsService.getPrice(
          item.productId,
          item.quantity,
          userRole,
        )

        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
          selectedVariants: item.selectedVariants,
        }
      }),
    )

    // 2. Apply coupon if provided
    let discountAmount = 0
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      })

      if (coupon && coupon.isActive && new Date() <= coupon.validUntil) {
        const subtotalForDiscount = orderItems.reduce((s, i) => s + i.subtotal, 0)
        if (!coupon.minOrderAmount || subtotalForDiscount >= coupon.minOrderAmount) {
          discountAmount =
            coupon.discountType === 'percentage'
              ? (subtotalForDiscount * coupon.discountValue) / 100
              : coupon.discountValue
        }
      }
    }

    // 3. Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
    const shipping = subtotal > 500 ? 0 : 15 // Free shipping over $500
    const tax = (subtotal - discountAmount) * 0.18 // 18% IGV (Peru)
    const total = subtotal - discountAmount + shipping + tax

    // 4. Handle shipping address
    let shippingAddressId = dto.shippingAddressId
    if (!shippingAddressId && dto.newAddress) {
      const addr = await this.prisma.address.create({
        data: { ...dto.newAddress, userId },
      })
      shippingAddressId = addr.id
    }

    // 5. Create order in transaction
    const order = await this.prisma.$transaction(async tx => {
      const newOrder = await tx.order.create({
        data: {
          customerId: userId,
          shippingAddressId,
          paymentMethod: dto.paymentMethod,
          subtotal,
          shipping,
          tax,
          discountAmount,
          total,
          couponCode: dto.couponCode,
          notes: dto.notes,
          items: { create: orderItems },
          statusHistory: {
            create: { status: 'PENDING', note: 'Order created' },
          },
          payment: {
            create: {
              method: dto.paymentMethod,
              amount: total,
              status: 'PENDING',
            },
          },
        },
        include: {
          items: true,
          payment: true,
          shippingAddress: true,
        },
      })

      // 6. Decrement stock
      await Promise.all(
        orderItems.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      )

      // 7. Log inventory movements
      await tx.inventoryMovement.createMany({
        data: orderItems.map(item => ({
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reason: 'Sale',
          reference: newOrder.id,
        })),
      })

      return newOrder
    })

    // 8. Notify admin via WebSocket
    this.eventsGateway.notifyNewOrder({
      orderId: order.id,
      total: order.total,
      paymentMethod: order.paymentMethod,
    })

    return order
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } })
    if (!order) throw new NotFoundException('Order not found')

    return this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status as any,
        statusHistory: {
          create: { status: dto.status as any, note: dto.note },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        items: true,
        payment: true,
      },
    })
  }

  async getMyOrders(userId: string, page = 1, limit = 10) {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: userId },
        include: { items: true, payment: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { customerId: userId } }),
    ])
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}
