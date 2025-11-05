import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductSizeWithoutProductDto } from './product-size-data.dto';

/**
 * DTO for replacing all product sizes
 */
export class ReplaceByProductIdDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /**
   * Array of sizes to replace existing ones
   */
  @IsArray()
  @ArrayMinSize(0, { message: 'Sizes array can be empty' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeWithoutProductDto)
  sizes: CreateProductSizeWithoutProductDto[];
}
