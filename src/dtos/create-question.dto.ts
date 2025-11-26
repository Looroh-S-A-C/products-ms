import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, Min } from 'class-validator';
import { QuestionType } from 'qeai-sdk';

/**
 * DTO for creating a question
 */
export class CreateQuestionDto {
  /**
   * Question text
   * @example "What size would you like?"
   */
  @IsString()
  name: string;

  /**
   * Whether the question is required
   * @example true
   * @default false
   */
  @IsOptional()
  @IsBoolean()
  required?: boolean = false;

  /**
   * Minimum value for numeric questions
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  min?: number;

  /**
   * Maximum value for numeric questions
   * @example 10
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  max?: number;

  /**
   * Question type
   * @example "SINGLE_CHOICE"
   */
  @IsEnum(QuestionType)
  type: QuestionType;

  /**
   * Question status
   * @example true
   * @default true
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
