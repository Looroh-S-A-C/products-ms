import { PartialType } from '@nestjs/mapped-types';
import { CreateChainDto } from './create-chain.dto';
import { IsMongoId, IsString, IsUUID } from 'class-validator';

/**
 * DTO for updating a chain
 */
export class UpdateChainDto extends PartialType(CreateChainDto) {
  /**
   * Chain ID to update
   * @example "chain-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;

  /**
   * User who updated the chain
   * @example "user456"
   */
  @IsString()
  @IsMongoId()
  updatedBy: string;
}
