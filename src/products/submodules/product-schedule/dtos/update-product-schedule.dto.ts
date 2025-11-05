import { IsString, IsOptional, IsInt, Min, Max, Matches, IsUUID, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating an existing product schedule
 */
export class UpdateProductScheduleDto {
   /**
   * Schedule ID
   */
   @IsString()
   @IsNotEmpty()
   @IsUUID()
   id: string;
  /**
   * Day of week (0-6, where 0 is Sunday)
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  /**
   * Start time in HH:MM format
   */
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime?: string;

  /**
   * End time in HH:MM format
   */
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime?: string;
}


