// src/modules/reports/reports.controller.ts
import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  getKpis() {
    return this.reportsService.getDashboardKpis()
  }

  @Get('sales-chart')
  @ApiOperation({ summary: 'Get sales chart data (last N days)' })
  getSalesChart(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.reportsService.getSalesChart(days)
  }

  @Get('sales-by-category')
  @ApiOperation({ summary: 'Get sales distribution by category' })
  getSalesByCategory() {
    return this.reportsService.getSalesByCategory()
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get full sales report with date range' })
  getSalesReport(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportsService.getSalesReport(dateFrom, dateTo)
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  getTopProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reportsService.getTopProducts(limit)
  }
}
