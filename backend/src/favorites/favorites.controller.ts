import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard) // giriş şart
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
  ) {}

  // Favoriye ekle
  @Post(':productId')
  addFavorite(
    @Param('productId') productId: string,
    @Req() req,
  ) {
    return this.favoritesService.addToFavorites(
      req.user,
      Number(productId),
    );
  }

  // Favorileri listele
  @Get()
  getFavorites(@Req() req) {
    return this.favoritesService.findMyFavorites(req.user.id);
  }

  // Favoriden çıkar
  @Delete(':productId')
  removeFavorite(
    @Param('productId') productId: string,
    @Req() req,
  ) {
    return this.favoritesService.removeFromFavorites(
      req.user.id,
      Number(productId),
    );
  }
}
