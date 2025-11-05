import { IsMongoId, IsString, IsUUID } from 'class-validator';

/**
 * DTO for deleting a category
 */
export class DeleteCategoryDto {
  /**
   * Category ID to delete
   * @example "category-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;

  /**
   * User who deleted the category
   * @example "user456"
   */
  @IsString()
  @IsMongoId()
  deletedBy: string;
}

