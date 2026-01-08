import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
import { ProductPlatformsService } from './product-platforms.service';
import { CreateProductPlatformDto } from './dtos/create-product-platform.dto';
import { UpdateProductPlatformDto } from './dtos/update-product-platform.dto';

@Controller('product-platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ProductPlatformsController {
  constructor(private readonly productPlatformsService: ProductPlatformsService) {}

  // ADMIN: ürün listelemesi ekle
  @Post()
  create(
    @Body() body: CreateProductPlatformDto,
  ) {
    return this.productPlatformsService.create(body);
  }

  // ADMIN: ürün listelemesi güncelle (fiyat/url/platform)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateProductPlatformDto,
  ) {
    return this.productPlatformsService.update(Number(id), body);
  }

  // ADMIN: ürün listelemesi sil
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productPlatformsService.remove(Number(id));
  }
}


