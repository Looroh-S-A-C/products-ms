import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID, IsMongoId } from 'class-validator';

/**
 * DTO for creating a new tag
 */
export class CreateTagDto {
  /**
   * Name of the tag
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  /**
   * User who created the tag
   */
  @IsOptional()
  @IsString()
  @IsMongoId()
  createdBy?: string;
}

