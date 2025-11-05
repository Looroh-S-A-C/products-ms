import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { IsMongoId, IsString, IsUUID } from 'class-validator';

/**
 * DTO for updating a restaurant
 */
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  /**
   * Restaurant ID to update
   * @example "restaurant-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;

  /**
   * User who updated the restaurant
   * @example "user456"
   */
  @IsString()
  @IsMongoId()
  updatedBy: string;
}
