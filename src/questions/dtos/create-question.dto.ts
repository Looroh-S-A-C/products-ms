import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum, Min, Max, IsMongoId } from 'class-validator';
import { QuestionType } from '@prisma/client';

/**
 * DTO for creating a new question
 */
export class CreateQuestionDto {
  /**
   * Question text/name
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Whether the question is required
   */
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  /**
   * Minimum value for numeric questions
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  min?: number;

  /**
   * Maximum value for numeric questions
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  max?: number;

  /**
   * Type of question
   */
  @IsEnum(QuestionType)
  type: QuestionType;

  /**
   * User who created the question
   */
  @IsString()
  @IsMongoId()
  createdBy?: string;
}

