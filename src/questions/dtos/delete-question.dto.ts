import { IsString, IsNotEmpty, IsMongoId, IsUUID } from 'class-validator';

/**
 * DTO for soft deleting a question
 */
export class DeleteQuestionDto {
  
  /**
   * Question ID to delete
   * @example "question-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;
  /**
   * User who deleted the question
   */
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  deletedBy: string;
}

