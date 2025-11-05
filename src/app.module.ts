import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ChainModule } from './chain/chain.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { CategoriesModule } from './categories/categories.module';
import { TranslationsModule } from './translations/translations.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { QuestionsModule } from './questions/questions.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [
    ProductsModule,
    ChainModule,
    RestaurantsModule,
    CategoriesModule,
    TranslationsModule,
    IngredientsModule,
    QuestionsModule,
    TagsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
