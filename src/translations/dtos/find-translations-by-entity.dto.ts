import { IsString, IsEnum, IsUUID } from 'class-validator';
import { TranslationEntityType } from '../enums/translation-entity-type.enum';

/**
 * DTO for finding translations by entity
 */
export class FindTranslationsByEntityDto {
  /**
   * Type of entity to find translations for
   * @example "categoryId"
   */
  @IsEnum(TranslationEntityType)
  entityType: TranslationEntityType;

  /**
   * ID of the entity to find translations for
   * @example "category-uuid-123"
   */
  @IsString()
  @IsUUID()
  entityId: string;
}
