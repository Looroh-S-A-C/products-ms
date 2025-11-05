import { IsString, IsOptional, IsBoolean, IsMongoId } from 'class-validator';

/**
 * DTO for creating a new restaurant
 */
export class CreateRestaurantDto {
  /**
   * Chain ID that owns this restaurant
   * @example "chain-uuid-123"
   */
  @IsString()
  chainId: string;

  /**
   * Restaurant name
   * @example "McDonald's Downtown"
   */
  @IsString()
  name: string;


  /**
   * Restaurant address
   * @example "123 Main St, Downtown"
   */
  @IsOptional()
  @IsString()
  address?: string;

  /**
   * Restaurant phone number
   * @example "+1-555-0123"
   */
  @IsOptional()
  @IsString()
  phone?: string;

  /**
   * Restaurant timezone
   * @example "America/New_York"
   */
  @IsOptional()
  @IsString()
  timezone?: string;

  /**
   * Restaurant status
   * @example true
   * @default true
   */
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;

  /**
   * User who created the restaurant
   * @example "user123"
   */
  @IsString()
  @IsMongoId()
  createdBy: string;
}
