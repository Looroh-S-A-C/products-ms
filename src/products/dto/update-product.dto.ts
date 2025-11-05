import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsMongoId, IsString, IsUUID } from 'class-validator';

/**
 * DTO for updating a product
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  /**
   * Product ID to update
   * @example "product-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;

   /**
   * User who updated the product
   * @example "user456"
   */
   @IsString()
   @IsMongoId()
   updatedBy?: string;
}
