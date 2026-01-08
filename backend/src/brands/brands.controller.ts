import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dtos/create-brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // herkes görebilir (dropdown için)
  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  // sadece admin (marka eklemek için)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto.name);
  }
}


