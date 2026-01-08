import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductPlatform } from './product-platform.entity';
import { Product } from '../products/product.entity';
import { Platform } from '../platforms/platform.entity';

@Injectable()
export class ProductPlatformsService {
  constructor(
    @InjectRepository(ProductPlatform)
    private readonly productPlatformRepository: Repository<ProductPlatform>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  private validate(payload: { price?: number; url?: string }) {
    const price = Number(payload.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException('Fiyat geçerli olmalı');
    }
    const url = (payload.url || '').trim();
    if (!url) {
      throw new BadRequestException('URL zorunlu');
    }
    return { price, url };
  }

  async create(payload: { productId: number; platformId: number; price: number; url: string }) {
    const { price, url } = this.validate(payload);

    const product = await this.productRepository.findOne({
      where: { id: payload.productId },
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');

    const platform = await this.platformRepository.findOne({
      where: { id: payload.platformId },
    });
    if (!platform) throw new NotFoundException('Platform bulunamadı');

    const pp = this.productPlatformRepository.create({
      product,
      platform,
      price,
      url,
    });
    return this.productPlatformRepository.save(pp);
  }

  async update(id: number, payload: { platformId?: number; price?: number; url?: string }) {
    const pp = await this.productPlatformRepository.findOne({
      where: { id },
      relations: ['platform', 'product'],
    });
    if (!pp) throw new NotFoundException('Listeleme bulunamadı');

    const { price, url } = this.validate({
      price: payload.price ?? pp.price,
      url: payload.url ?? pp.url,
    });
    pp.price = price;
    pp.url = url;

    if (payload.platformId) {
      const platform = await this.platformRepository.findOne({
        where: { id: payload.platformId },
      });
      if (!platform) throw new NotFoundException('Platform bulunamadı');
      pp.platform = platform;
    }

    return this.productPlatformRepository.save(pp);
  }

  async remove(id: number) {
    const pp = await this.productPlatformRepository.findOne({ where: { id } });
    if (!pp) throw new NotFoundException('Listeleme bulunamadı');
    await this.productPlatformRepository.remove(pp);
    return { message: 'Listeleme silindi' };
  }
}


