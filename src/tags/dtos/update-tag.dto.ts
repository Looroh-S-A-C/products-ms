import { IsString, IsOptional, MaxLength, IsMongoId, IsUUID } from 'class-validator';

/**
 * DTO for updating an existing tag
 */
export class UpdateTagDto {
  /**
   * Tag ID to update
   * @example "tag-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;
  /**
   * Name of the tag
   */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  /**
   * User who updated the tag
   */
  @IsString()
  @IsMongoId()
  updatedBy?: string;
}

