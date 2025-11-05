import { IsString, IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { QuestionProductType } from '@prisma/client';

/**
 * DTO for finding product questions by product ID and type
 */
export class FindByProductIdAndTypeDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  /**
   * Question type
   */
  @IsEnum(QuestionProductType)
  type: QuestionProductType;
}
