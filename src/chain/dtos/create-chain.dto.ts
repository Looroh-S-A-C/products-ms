import { IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsUUID, IsMongoId } from 'class-validator';
import { Currency } from '../../enums/currency.enum';

/**
 * DTO for creating a new chain
 */
export class CreateChainDto {
  /**
   * Chain name
   * @example "McDonald's"
   */
  @IsString()
  name: string;

  /**
   * Chain currency code
   * @example "PEN"
   * @default "PEN"
   */
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  /**
   * Global tax percentage for the chain
   * @example 8.5
   * @default 0.0
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent?: number;

  /**
   * User who created the chain
   * @example "user123"
   */
  @IsOptional()
  @IsString()
  @IsMongoId()
  createdBy?: string;
}
