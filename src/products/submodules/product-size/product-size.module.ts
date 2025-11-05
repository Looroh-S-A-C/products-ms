import { Module } from '@nestjs/common';
import { ProductSizeService } from './product-size.service';
import { ProductSizeController } from './product-size.controller';

@Module({
  controllers: [ProductSizeController],
  providers: [ProductSizeService],
})
export class ProductSizeModule {}
