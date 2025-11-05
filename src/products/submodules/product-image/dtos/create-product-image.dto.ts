import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl, IsUUID } from 'class-validator';

/**
 * DTO for creating a new product image
 */
export class CreateProductImageDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  /**
   * Image URL
   */
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  /**
   * Whether this is the primary image
   */
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

