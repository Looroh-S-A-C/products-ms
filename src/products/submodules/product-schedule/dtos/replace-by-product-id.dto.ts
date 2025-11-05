import { IsString, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductScheduleWithoutProductDto } from './product-schedule-data.dto';

/**
 * DTO for replacing all product schedules
 */
export class ReplaceByProductIdDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /**
   * Array of schedules to replace existing ones
   */
  @IsArray()
  @ArrayMinSize(0, { message: 'Schedules array can be empty' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductScheduleWithoutProductDto)
  schedules: CreateProductScheduleWithoutProductDto[];
}
