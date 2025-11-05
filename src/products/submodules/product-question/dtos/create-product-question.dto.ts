import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, Min, IsUUID } from 'class-validator';
import { QuestionProductType } from '@prisma/client';

/**
 * DTO for creating a new product-question relationship
 */
export class CreateProductQuestionDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  /**
   * Question ID
   */
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  questionId: string;

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
  @IsEnum(QuestionProductType)
  itemType: QuestionProductType;
}

