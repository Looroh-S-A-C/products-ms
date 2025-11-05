import { IsString, IsOptional, IsInt, IsEnum, Min, IsNotEmpty, IsUUID } from 'class-validator';
import { QuestionProductType } from '@prisma/client';

/**
 * DTO for updating an existing product-question relationship
 */
export class UpdateProductQuestionDto {
  /**
   * Image ID to delete
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  /**
   * Position/order of the question
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  /**
   * Type of the question-product relationship
   */
  @IsOptional()
  @IsEnum(QuestionProductType)
  itemType?: QuestionProductType;
}
