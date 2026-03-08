// src/modules/inventory/inventory.module.ts
import { Module } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { InventoryController } from './inventory.controller'
import { PrismaService } from '../../prisma.service'
import { WebsocketsModule } from '../websockets/websockets.module'

@Module({
  imports: [WebsocketsModule],
  controllers: [InventoryController],
  providers: [InventoryService, PrismaService],
  exports: [InventoryService],
})
export class InventoryModule {}
