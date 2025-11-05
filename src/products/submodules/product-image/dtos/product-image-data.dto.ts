import { OmitType } from '@nestjs/mapped-types';
import { CreateProductImageDto } from './create-product-image.dto';

/**
 * DTO for creating multiple images without requiring productId
 */
export class CreateProductImageWithoutProductDto extends OmitType(
  CreateProductImageDto,
  ['productId'] as const,
) {}
