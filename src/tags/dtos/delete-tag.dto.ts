import { IsString, IsNotEmpty, IsMongoId, IsUUID } from 'class-validator';

/**
 * DTO for soft deleting a tag
 */
export class DeleteTagDto {
  /**
   * Tag ID to delete
   * @example "tag-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;
  /**
   * User who deleted the tag
   */
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  deletedBy: string;
}
