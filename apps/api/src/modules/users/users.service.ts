// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number
    limit?: number
    role?: string
    status?: string
    search?: string
  }) {
    const { page = 1, limit = 20, role, status, search } = query
    const where: any = {}
    if (role) where.role = role
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true, status: true,
          businessName: true, creditLimit: true, phone: true, createdAt: true,
          _count: { select: { orders: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    // Add totalSpent for each user
    const enriched = await Promise.all(
      items.map(async user => {
        const spent = await this.prisma.order.aggregate({
          where: { customerId: user.id, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
          _sum: { total: true },
        })
        return {
          ...user,
          totalOrders: user._count.orders,
          totalSpent: spent._sum.total || 0,
        }
      }),
    )

    return { items: enriched, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true, status: true,
        businessName: true, creditLimit: true, phone: true, createdAt: true,
        addresses: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async approveWholesale(id: string, creditLimit?: number) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    if (user.role !== 'WHOLESALE') throw new ForbiddenException('User is not a wholesale account')

    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        creditLimit: creditLimit || user.creditLimit,
      },
      select: {
        id: true, email: true, name: true, role: true,
        status: true, businessName: true, creditLimit: true,
      },
    })
  }

  async blockUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'BLOCKED' },
      select: { id: true, email: true, status: true },
    })
  }

  async unblockUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
      select: { id: true, email: true, status: true },
    })
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; businessName?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, name: true, role: true,
        businessName: true, phone: true,
      },
    })
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    const bcrypt_ = await import('bcryptjs')
    const valid = await bcrypt_.compare(currentPassword, user.password)
    if (!valid) throw new ForbiddenException('Current password is incorrect')

    const hashed = await bcrypt_.hash(newPassword, 12)
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })
    return { message: 'Password updated successfully' }
  }

  async getWholesaleRequests() {
    return this.prisma.user.findMany({
      where: { role: 'WHOLESALE', status: 'PENDING' },
      select: {
        id: true, email: true, name: true, businessName: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
