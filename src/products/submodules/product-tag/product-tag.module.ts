import { Module } from '@nestjs/common';
import { ProductTagService } from './product-tag.service';
import { ProductTagController } from './product-tag.controller';

@Module({
  controllers: [ProductTagController],
  providers: [ProductTagService],
})
export class ProductTagModule {}
