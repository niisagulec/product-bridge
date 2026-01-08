import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platform } from './platform.entity';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectRepository(Platform)
    private readonly platformRepository: Repository<Platform>,
  ) {}

  findAll() {
    return this.platformRepository.find({ order: { name: 'ASC' } });
  }

  async create(name: string) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      throw new BadRequestException('Platform adı zorunlu');
    }

    const existing = await this.platformRepository.findOne({
      where: { name: trimmed },
    });
    if (existing) return existing;

    const platform = this.platformRepository.create({ name: trimmed });
    return this.platformRepository.save(platform);
  }
}


