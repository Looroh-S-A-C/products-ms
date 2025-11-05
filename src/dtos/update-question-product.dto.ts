import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionProductDto } from './create-question-product.dto';

/**
 * DTO for updating a question-product relationship
 */
export class UpdateQuestionProductDto extends PartialType(CreateQuestionProductDto) {}

