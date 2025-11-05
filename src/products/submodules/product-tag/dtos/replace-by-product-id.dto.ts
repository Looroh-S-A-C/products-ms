import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

/**
 * DTO for replacing all product-tag relationships
 */
export class ReplaceByProductIdDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /**
   * Array of tag IDs to replace existing relationships
   */
  @IsArray()
  @ArrayMinSize(0, { message: 'Tag IDs array can be empty' })
  tagIds: string[];
}
