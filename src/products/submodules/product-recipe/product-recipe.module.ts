import { Module } from '@nestjs/common';
import { ProductRecipeService } from './product-recipe.service';
import { ProductRecipeController } from './product-recipe.controller';

@Module({
  controllers: [ProductRecipeController],
  providers: [ProductRecipeService],
})
export class ProductRecipeModule {}
