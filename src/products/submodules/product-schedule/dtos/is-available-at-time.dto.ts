import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

/**
 * DTO for checking product availability at specific time
 */
export class IsAvailableAtTimeDto {
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
   * Time in HH:MM format
   */
  @IsString()
  @IsNotEmpty()
  time: string;
}
