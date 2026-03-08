// src/modules/products/dto/create-product.dto.ts
import {
  IsString, IsNumber, IsOptional, IsEnum, IsArray,
  Min, ValidateNested, IsInt,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProductStatus } from '@prisma/client'

export class VolumePricingDto {
  @IsInt() @Min(1)
  minQty: number

  @IsOptional() @IsInt()
  maxQty?: number

  @IsNumber() @Min(0)
  price: number
}

export class ProductVariantDto {
  @IsString() name: string
  @IsString() type: string
  @IsArray() @IsString({ each: true }) options: string[]
}

export class CreateProductDto {
  @ApiProperty() @IsString() name: string
  @ApiProperty() @IsString() slug: string
  @ApiProperty() @IsString() sku: string
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() images?: string[]
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string
  @ApiProperty() @IsString() categoryId: string
  @ApiProperty() @IsNumber() @Min(0) retailPrice: number
  @ApiProperty() @IsNumber() @Min(0) wholesalePrice: number
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) stock?: number
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) minStock?: number
  @ApiPropertyOptional({ enum: ProductStatus }) @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus
  @ApiPropertyOptional() @IsOptional() @IsString() warehouseLocation?: string
  @ApiPropertyOptional({ type: [VolumePricingDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VolumePricingDto)
  volumePricing?: VolumePricingDto[]
  @ApiPropertyOptional({ type: [ProductVariantDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[]
}
