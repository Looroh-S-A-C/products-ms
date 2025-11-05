import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsMongoId,
} from 'class-validator';

/**
 * DTO for creating a new ingredient
 */
export class CreateIngredientDto {
  /**
   * Name of the ingredient
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  /**
   * Unit of measurement for the ingredient
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unit: string;

  /**
   * User who created the ingredient
   */
  @IsString()
  @IsMongoId()
  createdBy: string;
}
