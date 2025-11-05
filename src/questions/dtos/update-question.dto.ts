import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, Min, Max, IsUUID, IsMongoId } from 'class-validator';
import { QuestionType } from '@prisma/client';

/**
 * DTO for updating an existing question
 */
export class UpdateQuestionDto {
   /**
   * Question ID to update
   * @example "question-uuid-123"
   */
   @IsString()
   @IsUUID()
   id: string;
  /**
   * Question text/name
   */
  @IsOptional()
  @IsString()
  name?: string;

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
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  /**
   * User who updated the question
   */
  @IsMongoId()
  @IsString()
  updatedBy?: string;
}

