import { IsString } from 'class-validator';

/**
 * DTO for creating a product translation
 */
export class CreateProductTranslationDto {
  /**
   * Language code for the translation
   * @example "es"
   */
  @IsString()
  languageCode: string;

  /**
   * Product name in the specified language
   * @example "Big Mac"
   */
  @IsString()
  name: string;

  /**
   * Product description in the specified language
   * @example "Dos hamburguesas de carne, salsa especial, lechuga, queso, pepinillos, cebolla en pan con semillas de sésamo"
   */
  @IsString()
  description: string;

  /**
   * Product ID this translation belongs to
   * @example "product-uuid-123"
   */
  @IsString()
  productId: string;
}
