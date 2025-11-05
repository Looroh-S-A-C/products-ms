import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

/**
 * DTO for creating a new product recipe entry
 */
export class CreateProductRecipeDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /**
   * Ingredient ID
   */
  @IsString()
  @IsNotEmpty()
  ingredientId: string;

  /**
   * Quantity of the ingredient
   */
  @IsNumber()
  @IsPositive()
  quantity: number;

  /**
   * Unit of measurement
   */
  @IsString()
  @IsNotEmpty()
  unit: string;
}


