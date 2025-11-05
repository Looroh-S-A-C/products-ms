import { IsString, IsUUID } from 'class-validator';

/**
 * DTO for deleting a translation
 */
export class DeleteTranslationDto {
  /**
   * Translation ID to delete
   * @example "translation-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;
}

