import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductRecipeWithoutProductDto } from './product-question-data.dto';

/**
 * DTO for replacing all product-question relationships
 */
export class ReplaceByProductIdDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  /**
   * Array of questions to replace existing ones
   */
  @IsArray()
  @ArrayMinSize(0, { message: 'Recipes array can be empty' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductRecipeWithoutProductDto)
  recipes: CreateProductRecipeWithoutProductDto[];
}
