import { Module } from '@nestjs/common';
import { ProductQuestionService } from './product-question.service';
import { ProductQuestionController } from './product-question.controller';

@Module({
  controllers: [ProductQuestionController],
  providers: [ProductQuestionService],
})
export class ProductQuestionModule {}
