import { IsString, IsOptional, MaxLength, IsUUID, IsMongoId } from 'class-validator';

/**
 * DTO for updating an existing ingredient
 */
export class UpdateIngredientDto {
  /**
   * Ingredient ID to update
   * @example "ingredient-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;
  /**
   * Name of the ingredient
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  /**
   * Unit of measurement for the ingredient
   */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  /**
   * User who updated the ingredient
   */
  @IsString()
  @IsMongoId()
  updatedBy: string;
}
