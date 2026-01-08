// uygulamanın konfigürasyonunu başlattı ve
// postgressql veritabanını bağlantısı typeorm ile yapılandırdı

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { ProductTypesModule } from './product-types/product-type.module';
import { BrandsModule } from './brands/brands.module';
import { PlatformsModule } from './platforms/platforms.module';
import { ProductPlatformsModule } from './product-platforms/product-platforms.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // .env dosyasını okur
    ConfigModule.forRoot({
      isGlobal: true, // tüm modüllerde kullanılabilir 
    }),
    // postgres veritabanı bağlantısı, bilgiler .envden alınır
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, // entityleri otomatik yükler
      synchronize: true, // veritabanı şemasını otomatik senkronize eder
    }),
    UsersModule,
    ProductsModule,
    ProductTypesModule,
    BrandsModule,
    PlatformsModule,
    ProductPlatformsModule,
    FavoritesModule,
    AuthModule,
  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
