import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO for setting the primary image of a product.
 * Contains the required fields to identify both the product and the image.
 */
export class SetPrimaryImageDto {
  /**
   * Product ID associated with the image.
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  /**
   * Image ID to be set as the primary image for the given product.
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  imageId: string;
}
