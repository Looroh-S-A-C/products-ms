import { Module } from '@nestjs/common';
import { ProductTagService } from './product-tag.service';
import { ProductTagController } from './product-tag.controller';
import { NatsModule } from 'src/transport/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [ProductTagController],
  providers: [ProductTagService],
})
export class ProductTagModule {}
