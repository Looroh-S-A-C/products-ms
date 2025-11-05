import { PartialType } from '@nestjs/mapped-types';
import { CreateTranslationDto } from './create-translation.dto';
import { IsString, IsUUID } from 'class-validator';

/**
 * DTO for updating a translation
 */
export class UpdateTranslationDto extends PartialType(CreateTranslationDto) {
  /**
   * Translation ID to update
   * @example "translation-uuid-123"
   */
  @IsString()
  @IsUUID()
  id: string;
}

