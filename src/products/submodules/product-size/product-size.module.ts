import { Module } from '@nestjs/common';
import { ProductSizeService } from './product-size.service';
import { ProductSizeController } from './product-size.controller';
import { NatsModule } from 'src/transport/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [ProductSizeController],
  providers: [ProductSizeService],
})
export class ProductSizeModule {}
