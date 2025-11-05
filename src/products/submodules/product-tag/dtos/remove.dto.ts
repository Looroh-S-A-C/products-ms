import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for removing product-tag relationship by IDs
 */
export class RemoveDto {
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
