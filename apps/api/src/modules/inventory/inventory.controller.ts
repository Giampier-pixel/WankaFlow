// src/modules/inventory/inventory.controller.ts
import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { InventoryService } from './inventory.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get inventory overview stats' })
  getOverview() {
    return this.inventoryService.getOverview()
  }

  @Get()
  @ApiOperation({ summary: 'List all products with stock info' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.inventoryService.findAll({
      page, limit, search, lowStock: lowStock === 'true',
    })
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products below minimum stock' })
  getLowStock() {
    return this.inventoryService.getLowStockProducts()
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get inventory movement history' })
  getMovements(
    @Query('productId') productId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    return this.inventoryService.getMovements(productId, page, limit)
  }

  @Post(':productId/adjust')
  @ApiOperation({ summary: 'Manually adjust product stock' })
  adjustStock(
    @Param('productId') productId: string,
    @Body() data: { quantity: number; type: 'IN' | 'OUT' | 'ADJUSTMENT'; reason: string },
  ) {
    return this.inventoryService.adjustStock(
      productId, data.quantity, data.type, data.reason,
    )
  }
}
