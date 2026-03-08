// src/modules/payments/payments.service.ts
import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class PaymentsService {
  private stripe: Stripe
  private readonly logger = new Logger(PaymentsService.name)

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('stripe.secretKey'), {
      apiVersion: '2025-02-24.acacia',
    })
  }

  // Create Stripe PaymentIntent for card payments
  async createPaymentIntent(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    })

    if (!order) throw new NotFoundException('Order not found')
    if (order.paymentMethod !== 'CARD') {
      throw new BadRequestException('Order is not set up for card payment')
    }

    const amountInCents = Math.round(order.total * 100)

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: this.config.get<string>('stripe.currency'),
      metadata: {
        orderId: order.id,
        customerId: order.customerId,
      },
    })

    await this.prisma.payment.update({
      where: { orderId },
      data: { stripePaymentIntentId: paymentIntent.id },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  }

  // Upload bank transfer proof
  async submitTransferProof(
    orderId: string,
    userId: string,
    data: { transferReference: string; proofUrl?: string },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    })

    if (!order) throw new NotFoundException('Order not found')
    if (order.customerId !== userId) throw new BadRequestException('Not your order')
    if (order.paymentMethod !== 'BANK_TRANSFER') {
      throw new BadRequestException('Order is not set for bank transfer')
    }

    return this.prisma.payment.update({
      where: { orderId },
      data: {
        transferReference: data.transferReference,
        transferProofUrl: data.proofUrl,
        status: 'PENDING', // Admin must confirm
      },
    })
  }

  // Admin confirms bank transfer manually
  async confirmTransfer(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    })
    if (!order) throw new NotFoundException('Order not found')

    return this.prisma.$transaction([
      this.prisma.payment.update({
        where: { orderId },
        data: { status: 'COMPLETED', paidAt: new Date() },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          statusHistory: {
            create: { status: 'PAID', note: 'Bank transfer confirmed by admin' },
          },
        },
      }),
    ])
  }

  // Handle Stripe webhook events
  async handleWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.get<string>('stripe.webhookSecret'),
      )
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`)
      throw new BadRequestException(`Webhook Error: ${err.message}`)
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        this.logger.log(`Unhandled Stripe event: ${event.type}`)
    }

    return { received: true }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) return

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { orderId },
        data: {
          status: 'COMPLETED',
          stripeChargeId: paymentIntent.latest_charge as string,
          paidAt: new Date(),
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          statusHistory: {
            create: { status: 'PAID', note: 'Payment confirmed via Stripe' },
          },
        },
      }),
    ])

    this.logger.log(`Payment succeeded for order: ${orderId}`)
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) return

    await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message,
      },
    })

    this.logger.warn(`Payment failed for order: ${orderId}`)
  }

  async getPaymentByOrder(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } })
  }
}
