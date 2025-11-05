import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';

/**
 * DTO for updating a question
 */
export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}

