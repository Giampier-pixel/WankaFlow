// src/modules/orders/dto/create-order.dto.ts
import { IsString, IsEnum, IsArray, IsNumber, IsOptional, ValidateNested, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PaymentMethod } from '@prisma/client'

export class OrderItemDto {
  @ApiProperty() @IsString() productId: string
  @ApiProperty() @IsInt() @Min(1) quantity: number
  @ApiPropertyOptional() @IsOptional() selectedVariants?: Record<string, string>
}

export class AddressDto {
  @IsString() name: string
  @IsString() street: string
  @IsString() city: string
  @IsString() state: string
  @IsString() country: string
  @IsString() zip: string
  @IsOptional() @IsString() phone?: string
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  shippingAddressId?: string

  @ApiPropertyOptional()
  @IsOptional() @ValidateNested() @Type(() => AddressDto)
  newAddress?: AddressDto

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  couponCode?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string
}

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status: string

  @IsOptional() @IsString()
  note?: string
}
