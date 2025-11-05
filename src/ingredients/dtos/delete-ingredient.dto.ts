import { IsString, IsNotEmpty, IsUUID, IsMongoId } from 'class-validator';

/**
 * DTO for soft deleting an ingredient
 */
export class DeleteIngredientDto {
  /**
   * Ingredient ID to delete
   * @example "ingredient-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;
  /**
   * User who deleted the ingredient
   */
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  deletedBy: string;
}
