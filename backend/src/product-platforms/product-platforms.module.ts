import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPlatform } from './product-platform.entity';
import { ProductPlatformsController } from './product-platforms.controller';
import { ProductPlatformsService } from './product-platforms.service';
import { Product } from '../products/product.entity';
import { Platform } from '../platforms/platform.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPlatform, Product, Platform])],
  controllers: [ProductPlatformsController],
  providers: [ProductPlatformsService],
})
export class ProductPlatformsModule {}
