import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a product size
 */
export class CreateProductSizeDto {
  /**
   * Product ID this size belongs to
   * @example "product-uuid-123"
   */
  @IsString()
  productId: string;

  /**
   * Size name
   * @example "Large"
   */
  @IsString()
  name: string;

  /**
   * Suggested price for this size
   * @example 7.99
   */
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @Type(() => Number)
  @Min(0)
  price: number;

  /**
   * Size status
   * @example true
   * @default true
   */
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}
