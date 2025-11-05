import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a menu item
 */
export class CreateMenuItemDto {
  /**
   * Menu category ID this item belongs to
   * @example "menu-category-uuid-123"
   */
  @IsString()
  categoryId: string;

  /**
   * Product ID to add to the menu
   * @example "product-uuid-123"
   */
  @IsString()
  productId: string;

  /**
   * Price override at menu level (optional)
   * @example 6.99
   */
  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @Type(() => Number)
  @Min(0)
  price?: number;

  /**
   * Item visibility in the menu
   * @example true
   * @default true
   */
  @IsOptional()
  @IsBoolean()
  visible?: boolean = true;

  /**
   * Position of this item in the category
   * @example 1
   * @default 0
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number = 0;

  /**
   * Stock at menu-item level (optional)
   * @example 50
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  /**
   * Item sold out status
   * @example false
   * @default false
   */
  @IsOptional()
  @IsBoolean()
  soldOut?: boolean = false;

  /**
   * Item available from date
   * @example "2024-01-01T00:00:00Z"
   */
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  /**
   * Item available to date
   * @example "2024-12-31T23:59:59Z"
   */
  @IsOptional()
  @IsDateString()
  availableTo?: string;

  /**
   * User who created the menu item
   * @example "user123"
   */
  @IsOptional()
  @IsString()
  createdBy?: string;
}
