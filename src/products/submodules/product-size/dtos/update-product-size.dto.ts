import { IsString, IsOptional, IsNumber, IsPositive, IsBoolean, MaxLength, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for updating an existing product size
 */
export class UpdateProductSizeDto {
   /**
   * Size ID
   */
   @IsString()
   @IsNotEmpty()
   @IsUUID()
   id: string;
  /**
   * Name of the size variant
   */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  /**
   * Price for this size variant
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price?: number;

  /**
   * Whether the size is active
   */
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}


