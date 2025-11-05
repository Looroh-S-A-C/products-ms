import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsMongoId, IsString, IsUUID } from 'class-validator';

/**
 * DTO for updating a category
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  
    /**
   * Category ID to update
   * @example "category-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;


  
  /**
   * User who updated the chain
   * @example "user456"
   */
  @IsString()
  @IsMongoId()
  updatedBy: string;
}
