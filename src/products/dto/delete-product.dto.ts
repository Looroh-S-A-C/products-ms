import { IsMongoId, IsString, IsUUID } from 'class-validator';

/**
 * DTO for deleting a product
 */
export class DeleteProductDto {
  /**
   * Product ID to delete
   * @example "product-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;

  /**
   * User who deleted the product
   * @example "user456"
   */
  @IsString()
  @IsMongoId()
  deletedBy: string;
}

