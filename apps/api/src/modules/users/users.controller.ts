// src/modules/users/users.controller.ts
import {
  Controller, Get, Patch, Post, Body, Param,
  Query, UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- Customer endpoints ---

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: { name?: string; phone?: string; businessName?: string },
  ) {
    return this.usersService.updateProfile(userId, data)
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change my password' })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(userId, data.currentPassword, data.newPassword)
  }

  // --- Admin endpoints ---

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: '[ADMIN] List all users' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ page, limit, role, status, search })
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('wholesale-requests')
  @ApiOperation({ summary: '[ADMIN] Get pending wholesale requests' })
  getWholesaleRequests() {
    return this.usersService.getWholesaleRequests()
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: '[ADMIN] Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve-wholesale')
  @ApiOperation({ summary: '[ADMIN] Approve wholesale account' })
  approveWholesale(
    @Param('id') id: string,
    @Body() data: { creditLimit?: number },
  ) {
    return this.usersService.approveWholesale(id, data.creditLimit)
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/block')
  @ApiOperation({ summary: '[ADMIN] Block user' })
  blockUser(@Param('id') id: string) {
    return this.usersService.blockUser(id)
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/unblock')
  @ApiOperation({ summary: '[ADMIN] Unblock user' })
  unblockUser(@Param('id') id: string) {
    return this.usersService.unblockUser(id)
  }
}
