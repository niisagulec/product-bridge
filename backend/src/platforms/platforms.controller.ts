import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dtos/create-platform.dto';

@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  // herkes görebilir (dropdown için)
  @Get()
  findAll() {
    return this.platformsService.findAll();
  }

  // sadece admin (platform eklemek için)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePlatformDto) {
    return this.platformsService.create(dto.name);
  }
}


