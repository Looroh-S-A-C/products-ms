import { IsString, IsOptional, IsNumber, IsPositive, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO for updating an existing product recipe entry
 */
export class UpdateProductRecipeDto {
  /**
   * Image ID to delete
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
  /**
   * Ingredient ID
   */
  @IsOptional()
  @IsString()
  ingredientId?: string;

  /**
   * Quantity of the ingredient
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;

  /**
   * Unit of measurement
   */
  @IsOptional()
  @IsString()
  unit?: string;
}
