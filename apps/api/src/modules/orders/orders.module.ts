// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { PrismaService } from '../../prisma.service'
import { ProductsModule } from '../products/products.module'
import { WebsocketsModule } from '../websockets/websockets.module'

@Module({
  imports: [ProductsModule, WebsocketsModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}
