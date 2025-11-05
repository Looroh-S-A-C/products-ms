import { OmitType } from '@nestjs/mapped-types';
import { CreateProductQuestionDto } from './create-product-question.dto';

/**
 * DTO for creating product-question relationships without requiring productId
 */
export class CreateProductQuestionWithoutProductDto extends OmitType(
  CreateProductQuestionDto,
  ['productId'] as const,
) {}
