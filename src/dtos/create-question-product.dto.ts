import { IsString, IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import { QuestionProductType } from '../enums/question-product-type.enum';

/**
 * DTO for creating a question-product relationship
 */
export class CreateQuestionProductDto {
  /**
   * Question ID
   * @example "question-uuid-123"
   */
  @IsString()
  questionId: string;

  /**
   * Product ID
   * @example "product-uuid-123"
   */
  @IsString()
  productId: string;

  /**
   * Position of this item
   * @example 1
   * @default 0
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number = 0;

  /**
   * Item type (QUESTION or ANSWER)
   * @example "ANSWER"
   */
  @IsEnum(QuestionProductType)
  itemType: QuestionProductType;
}
