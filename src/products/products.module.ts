import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductRecipeModule } from './submodules/product-recipe/product-recipe.module';
import { ProductSizeModule } from './submodules/product-size/product-size.module';
import { ProductScheduleModule } from './submodules/product-schedule/product-schedule.module';
import { ProductImageModule } from './submodules/product-image/product-image.module';
import { ProductTagModule } from './submodules/product-tag/product-tag.module';
import { ProductQuestionModule } from './submodules/product-question/product-question.module';

@Module({
  imports: [
    ProductRecipeModule,
    ProductSizeModule,
    ProductScheduleModule,
    ProductImageModule,
    ProductTagModule,
    ProductQuestionModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
