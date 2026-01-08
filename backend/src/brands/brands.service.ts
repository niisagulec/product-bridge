import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  findAll() {
    return this.brandRepository.find({ order: { name: 'ASC' } });
  }

  async create(name: string) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      throw new BadRequestException('Marka adı zorunlu');
    }

    const existing = await this.brandRepository.findOne({
      where: { name: trimmed },
    });
    if (existing) return existing;

    const brand = this.brandRepository.create({ name: trimmed });
    return this.brandRepository.save(brand);
  }
}


