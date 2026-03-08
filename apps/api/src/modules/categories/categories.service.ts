// src/modules/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
    return categories.map(c => ({
      ...c,
      productCount: c._count.products,
    }))
  }

  async findOne(slug: string) {
    const cat = await this.prisma.category.findUnique({ where: { slug } })
    if (!cat) throw new NotFoundException(`Category not found: ${slug}`)
    return cat
  }

  async create(data: { name: string; slug: string; icon?: string; description?: string }) {
    return this.prisma.category.create({ data })
  }

  async update(id: string, data: Partial<{ name: string; slug: string; icon: string; description: string }>) {
    return this.prisma.category.update({ where: { id }, data })
  }

  async remove(id: string) {
    return this.prisma.category.delete({ where: { id } })
  }
}
