import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsEnum, IsDecimal, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Product status enum
 */
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/**
 * DTO for creating a new product
 */
export class CreateProductDto {
  /**
   * Product SKU (Stock Keeping Unit)
   * @example "PROD-001"
   */
  @IsOptional()
  @IsString()
  sku?: string;

  /**
   * Product name
   * @example "Big Mac"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Product description
   * @example "Two all-beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun"
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Product base price
   * @example 5.99
   */
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @Type(() => Number)
  @Min(0)
  basePrice: number;

  /**
   * Product status
   * @example "ACTIVE"
   * @default "ACTIVE"
   */
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;

  /**
   * User who created the product
   * @example "user123"
   */
  @IsString()
  @IsMongoId()
  createdBy?: string;
}
