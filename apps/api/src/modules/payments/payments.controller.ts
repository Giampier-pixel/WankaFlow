// src/modules/payments/payments.controller.ts
import {
  Controller, Post, Get, Patch, Param, Body, Headers, RawBodyRequest,
  Req, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Request } from 'express'
import { UserRole } from '@prisma/client'
import { PaymentsService } from './payments.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Stripe webhook - must be public and receive raw body
  @Public()
  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody, signature)
  }

  @UseGuards(JwtAuthGuard)
  @Post('intent/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe PaymentIntent for card payment' })
  createPaymentIntent(@Param('orderId') orderId: string) {
    return this.paymentsService.createPaymentIntent(orderId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit bank transfer proof' })
  submitTransferProof(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
    @Body() data: { transferReference: string; proofUrl?: string },
  ) {
    return this.paymentsService.submitTransferProof(orderId, userId, data)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('transfer/:orderId/confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Confirm bank transfer payment' })
  confirmTransfer(@Param('orderId') orderId: string) {
    return this.paymentsService.confirmTransfer(orderId)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment info for an order' })
  getPayment(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrder(orderId)
  }
}
