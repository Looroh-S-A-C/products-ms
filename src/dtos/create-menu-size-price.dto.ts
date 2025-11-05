import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a menu size price
 */
export class CreateMenuSizePriceDto {
  /**
   * Menu item ID this size price belongs to
   * @example "menu-item-uuid-123"
   */
  @IsString()
  menuItemId: string;

  /**
   * Product size ID (optional, links to canonical ProductSize)
   * @example "product-size-uuid-123"
   */
  @IsOptional()
  @IsString()
  productSizeId?: string;

  /**
   * Size label
   * @example "Large"
   */
  @IsOptional()
  @IsString()
  label?: string;

  /**
   * Price for this size
   * @example 8.99
   */
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @Type(() => Number)
  @Min(0)
  price: number;

  /**
   * Stock for this size (optional)
   * @example 25
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
