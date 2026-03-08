// src/modules/orders/orders.controller.ts
import {
  Controller, Get, Post, Patch, Body, Param,
  Query, UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { OrdersService } from './orders.service'
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Customer: get my orders
  @Get('my')
  @ApiOperation({ summary: 'Get current user orders' })
  getMyOrders(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.getMyOrders(userId, page, limit)
  }

  // Admin: get all orders
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: '[ADMIN] List all orders' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.ordersService.findAll({ page, limit, status, customerId, paymentMethod, dateFrom, dateTo })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.ordersService.findOne(id, userId, userRole)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.ordersService.create(dto, userId, userRole)
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: '[ADMIN] Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto)
  }
}
