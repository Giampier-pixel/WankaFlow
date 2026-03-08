// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string

  @ApiPropertyOptional({ enum: ['RETAIL', 'WHOLESALE'], default: 'RETAIL' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  businessName?: string
}
