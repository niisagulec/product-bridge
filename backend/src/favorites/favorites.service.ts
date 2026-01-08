import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addToFavorites(user: User, productId: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Ürün bulunamadı');
    }
   
    const existing = await this.favoriteRepository.findOne({
      where: {
        user: { id: user.id },
        product: { id: productId },
      },
      relations: [
        'product',
        'product.productType',
        'product.productPlatforms',
        'product.productPlatforms.platform',
      ],
    });

    // 
    if (existing) {
      return existing;
    }

    const favorite = this.favoriteRepository.create({
      user,
      product,
    });

    return this.favoriteRepository.save(favorite);
  }

  async findMyFavorites(userId: number) {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: [
        'product',
        'product.productType',
        'product.productPlatforms',
        'product.productPlatforms.platform',
      ],
    });
  }

  async removeFromFavorites(userId: number, productId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (!favorite) {
      throw new BadRequestException('Favori bulunamadı');
    }

    await this.favoriteRepository.remove(favorite);
    return { message: 'Favorilerden çıkarıldı' };
  }
}
