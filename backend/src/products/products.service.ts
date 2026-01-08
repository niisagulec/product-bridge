import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // GET /products
  findAll(typeId?: number) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productType', 'productType')
      .leftJoinAndSelect('product.productPlatforms', 'productPlatforms')
      .leftJoinAndSelect('productPlatforms.platform', 'platform')
      .leftJoinAndSelect('product.brand', 'brand');

    if (typeId) {
      qb.andWhere('productType.id = :typeId', { typeId });
    }

    return qb.getMany();
  }

  // GET /products/:id
  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'brand',
        'productType',
        'productPlatforms',
        'productPlatforms.platform',
      ],
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return product;
  }

  // GET /products/search?q=xxx
  searchByName(q: string, typeId?: number) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productType', 'productType')
      .leftJoinAndSelect('product.productPlatforms', 'productPlatforms')
      .leftJoinAndSelect('productPlatforms.platform', 'platform')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.name ILIKE :q', { q: `%${q}%` })
      .orWhere('productType.name ILIKE :q', { q: `%${q}%` });

    if (typeId) {
      qb.andWhere('productType.id = :typeId', { typeId });
    }

    return qb.getMany();
  }

  // POST /products  (ADMIN)
  async create(data: any) {
    const product = this.productRepository.create({
      name: data.name,
      productType: data.productType
        ? { id: data.productType }
        : undefined,
      brand: data.brandId ? { id: data.brandId } : undefined,
    });

    return this.productRepository.save(product);
  }

  // PUT /products/:id  (ADMIN)
  async update(id: number, data: any) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    if (data.name) {
      product.name = data.name;
    }

    if (data.productType) {
      product.productType = { id: data.productType } as any;
    }

    // brandId gönderilirse set et; null/''/0 ile temizlemeye izin ver
    if (Object.prototype.hasOwnProperty.call(data, 'brandId')) {
      const brandId = Number(data.brandId);
      product.brand =
        Number.isFinite(brandId) && brandId > 0 ? ({ id: brandId } as any) : undefined;
    }

    return this.productRepository.save(product);
  }

  // DELETE /products/:id  (ADMIN)
  async remove(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    await this.productRepository.delete(id);
    return { message: 'Ürün silindi' };
  }
}
