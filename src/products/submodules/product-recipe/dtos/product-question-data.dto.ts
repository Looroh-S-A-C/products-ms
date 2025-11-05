import { OmitType } from '@nestjs/mapped-types';
import { CreateProductRecipeDto } from './create-product-recipe.dto';

/**
 * DTO for creating product-recipe relationships without requiring productId
 */
export class CreateProductRecipeWithoutProductDto extends OmitType(
  CreateProductRecipeDto,
  ['productId'] as const,
) {}
