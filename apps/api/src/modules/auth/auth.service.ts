// src/modules/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (exists) {
      throw new ConflictException('Email already registered')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12)

    // Wholesale accounts start as PENDING until admin approves
    const status = dto.role === 'WHOLESALE' ? 'PENDING' : 'ACTIVE'

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || 'RETAIL',
        status,
        businessName: dto.businessName,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        businessName: true,
        createdAt: true,
      },
    })

    return {
      user,
      message:
        dto.role === 'WHOLESALE'
          ? 'Account created. Awaiting admin approval for wholesale access.'
          : 'Account created successfully.',
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (user.status === 'BLOCKED') {
      throw new ForbiddenException('Account has been blocked')
    }

    if (user.status === 'PENDING') {
      throw new ForbiddenException(
        'Account pending approval. You will be notified once approved.',
      )
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        businessName: user.businessName,
        creditLimit: user.creditLimit,
      },
    }
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied')
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    return tokens
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    })
    return { message: 'Logged out successfully' }
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        businessName: true,
        creditLimit: true,
        phone: true,
        createdAt: true,
        addresses: true,
      },
    })
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: this.config.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
      }),
    ])

    return { accessToken, refreshToken }
  }
}
