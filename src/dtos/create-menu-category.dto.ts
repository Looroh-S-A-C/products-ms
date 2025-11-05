import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

/**
 * DTO for creating a menu category
 */
export class CreateMenuCategoryDto {
  /**
   * Menu ID this category belongs to
   * @example "menu-uuid-123"
   */
  @IsString()
  menuId: string;

  /**
   * Category ID to associate with this menu
   * @example "category-uuid-123"
   */
  @IsString()
  categoryId: string;

  /**
   * Position of this category in the menu
   * @example 1
   * @default 0
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number = 0;

  /**
   * Category status in this menu
   * @example true
   * @default true
   */
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;

  /**
   * User who created the menu category
   * @example "user123"
   */
  @IsOptional()
  @IsString()
  createdBy?: string;
}
