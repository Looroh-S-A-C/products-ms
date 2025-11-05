import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for individual size data in replace operation
 */
export class CreateProductSizeWithoutProductDto {
  /**
   * Name of the size variant
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  /**
   * Price for this size variant
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  /**
   * Whether the size is active
   */
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
