import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { LanguageCode } from '../../enums/language-code.enum';

/**
 * DTO for creating a translation
 */
export class CreateTranslationDto {
  /**
   * Language code for the translation
   * @example "es"
   */
  @IsEnum(LanguageCode)
  languageCode: LanguageCode;

  /**
   * Name in the specified language
   * @example "Bebidas"
   */
  @IsString()
  name: string;

  /**
   * Description in the specified language
   * @example "Todo tipo de bebidas"
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Category ID this translation belongs to (optional)
   * @example "category-uuid-123"
   */
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  /**
   * Product ID this translation belongs to (optional)
   * @example "product-uuid-123"
   */
  @IsOptional()
  @IsUUID()
  productId?: string;

  /**
   * Question ID this translation belongs to (optional)
   * @example "question-uuid-123"
   */
  @IsOptional()
  @IsUUID()
  questionId?: string;
}

