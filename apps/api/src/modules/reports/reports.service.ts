// src/modules/reports/reports.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardKpis() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const [
      todaySales,
      yesterdaySales,
      pendingOrders,
      newCustomersToday,
      newCustomersYesterday,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: yesterday, lt: today },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    ])

    const lowStock = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM products
      WHERE status = 'ACTIVE' AND stock <= "minStock"
    `

    const todayTotal = todaySales._sum.total || 0
    const yesterdayTotal = yesterdaySales._sum.total || 0
    const salesChange =
      yesterdayTotal > 0
        ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
        : 0

    return {
      todaySales: {
        value: todayTotal,
        ordersCount: todaySales._count,
        change: Math.round(salesChange),
        trend: salesChange >= 0 ? 'up' : 'down',
      },
      pendingOrders: {
        value: pendingOrders,
        trend: 'neutral',
      },
      lowStockItems: {
        value: Number(lowStock[0]?.count || 0),
        trend: 'neutral',
      },
      newCustomers: {
        value: newCustomersToday,
        change: newCustomersToday - newCustomersYesterday,
        trend: newCustomersToday >= newCustomersYesterday ? 'up' : 'down',
      },
    }
  }

  async getSalesChart(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    })

    // Group by day
    const grouped: Record<string, number> = {}
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0]
      grouped[day] = (grouped[day] || 0) + order.total
    })

    const labels = []
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      labels.push(key)
      data.push(grouped[key] || 0)
    }

    return { labels, datasets: [{ label: 'Sales', data }] }
  }

  async getSalesByCategory() {
    const result = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { subtotal: true },
    })

    // Join with products to get categories
    const productIds = result.map(r => r.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: { select: { name: true } } },
    })

    const categoryMap: Record<string, number> = {}
    result.forEach(r => {
      const product = products.find(p => p.id === r.productId)
      const category = product?.category?.name || 'Unknown'
      categoryMap[category] = (categoryMap[category] || 0) + (r._sum.subtotal || 0)
    })

    return {
      labels: Object.keys(categoryMap),
      datasets: [{ label: 'Sales by Category', data: Object.values(categoryMap) }],
    }
  }

  async getSalesReport(dateFrom: string, dateTo: string) {
    const where = {
      createdAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
      status: { not: 'CANCELLED' as any },
    }

    const [orders, summary] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true, role: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.aggregate({
        where,
        _sum: { total: true, subtotal: true, tax: true, shipping: true },
        _count: true,
        _avg: { total: true },
      }),
    ])

    return { orders, summary }
  }

  async getTopProducts(limit = 10) {
    const result = await this.prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: limit,
    })

    return result.map(r => ({
      productId: r.productId,
      productName: r.productName,
      totalQuantity: r._sum.quantity,
      totalRevenue: r._sum.subtotal,
    }))
  }
}
