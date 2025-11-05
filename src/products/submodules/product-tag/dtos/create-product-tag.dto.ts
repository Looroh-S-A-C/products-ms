import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for creating a new product-tag relationship
 */
export class CreateProductTagDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /**
   * Tag ID
   */
  @IsString()
  @IsNotEmpty()
  tagId: string;
}


