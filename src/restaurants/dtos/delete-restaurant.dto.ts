import { IsMongoId, IsString, IsUUID } from 'class-validator';

/**
 * DTO for deleting a restaurant
 */
export class DeleteRestaurantDto {
  /**
   * Restaurant ID to delete
   * @example "restaurant-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;

  /**
   * User who deleted the restaurant
   * @example "user456"
   */
  @IsString()
  @IsMongoId()
  deletedBy: string;
}

