import { IsString, IsNotEmpty, IsInt, Min, Max, Matches } from 'class-validator';

/**
 * DTO for creating a new product schedule
 */
export class CreateProductScheduleDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /**
   * Day of week (0-6, where 0 is Sunday)
   */
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  /**
   * Start time in HH:MM format
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  /**
   * End time in HH:MM format
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;
}


