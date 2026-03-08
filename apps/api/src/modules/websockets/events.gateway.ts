// src/modules/websockets/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(EventsGateway.name)
  private adminSockets = new Set<string>()

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '')

      if (token) {
        const payload = this.jwtService.verify(token, {
          secret: this.config.get<string>('jwt.secret'),
        })

        client.data.userId = payload.sub
        client.data.role = payload.role

        if (payload.role === 'ADMIN') {
          this.adminSockets.add(client.id)
          client.join('admins')
          this.logger.log(`Admin connected: ${client.id}`)
        }

        client.join(`user:${payload.sub}`)
      }

      this.logger.log(`Client connected: ${client.id}`)
    } catch {
      this.logger.warn(`Unauthenticated connection: ${client.id}`)
    }
  }

  handleDisconnect(client: Socket) {
    this.adminSockets.delete(client.id)
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  // Notify admins of a new order
  notifyNewOrder(data: { orderId: string; total: number; paymentMethod: string }) {
    this.server.to('admins').emit('new_order', {
      type: 'order',
      title: 'New Order',
      message: `Order #${data.orderId.slice(-6).toUpperCase()} — $${data.total.toFixed(2)} via ${data.paymentMethod}`,
      data,
      createdAt: new Date().toISOString(),
    })
  }

  // Notify admins of low stock
  notifyLowStock(data: { productId: string; productName: string; stock: number; minStock: number }) {
    this.server.to('admins').emit('low_stock', {
      type: 'stock',
      title: 'Low Stock Alert',
      message: `${data.productName} has only ${data.stock} units left (min: ${data.minStock})`,
      data,
      createdAt: new Date().toISOString(),
    })
  }

  // Notify specific user of order status update
  notifyOrderUpdate(userId: string, data: { orderId: string; status: string }) {
    this.server.to(`user:${userId}`).emit('order_update', {
      type: 'order',
      title: 'Order Updated',
      message: `Your order #${data.orderId.slice(-6).toUpperCase()} is now ${data.status}`,
      data,
      createdAt: new Date().toISOString(),
    })
  }

  // Broadcast KPI updates to admins
  broadcastKpis(data: any) {
    this.server.to('admins').emit('kpi_update', data)
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() })
  }
}
