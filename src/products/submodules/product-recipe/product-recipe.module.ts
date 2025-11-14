import { Module } from '@nestjs/common';
import { ProductRecipeService } from './product-recipe.service';
import { ProductRecipeController } from './product-recipe.controller';
import { NatsModule } from 'src/transport/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [ProductRecipeController],
  providers: [ProductRecipeService],
})
export class ProductRecipeModule {}
