import { IsString, IsOptional, IsBoolean, IsUrl, IsUUID, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating an existing product image
 */
export class UpdateProductImageDto {
  /**
   * Image ID to delete
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
  /**
   * Image URL
   */
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  /**
   * Whether this is the primary image
   */
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

