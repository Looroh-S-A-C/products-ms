import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsBoolean, MaxLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new product size
 */
export class CreateProductSizeDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  /**
   * Name of the size variant
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  /**
   * Price for this size variant
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  /**
   * Whether the size is active
   */
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}


