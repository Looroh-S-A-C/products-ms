import { IsMongoId, IsString, IsUUID } from 'class-validator';

/**
 * DTO for deleting a chain
 */
export class DeleteChainDto {
  /**
   * Chain ID to delete
   * @example "chain-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;

  /**
   * User who deleted the chain
   * @example "user456"
   */
  @IsString()
  @IsMongoId()
  deletedBy: string;
}

