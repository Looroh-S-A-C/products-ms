import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for finding product-tag relationship by IDs
 */
export class FindOneDto {
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
