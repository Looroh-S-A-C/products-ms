import { IsString, IsOptional, IsBoolean, IsMongoId } from 'class-validator';

/**
 * DTO for creating a new category
 */
export class CreateCategoryDto {
  /**
   * Category name
   * @example "Beverages"
   */
  @IsString()
  name: string;

  /**
   * Category description
   * @example "All types of drinks and beverages"
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Category status
   * @example true
   * @default true
   */
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;

  /**
   * User who created the category
   * @example "user123"
   */
  @IsString()
  @IsMongoId()
  createdBy: string;
}

