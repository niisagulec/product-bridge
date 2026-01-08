import api from './axios';
import type { Favorite } from '../types/product';

export async function listFavorites() {
  const res = await api.get<Favorite[]>('/favorites');
  return res.data;
}

export async function addFavorite(productId: number) {
  const res = await api.post<Favorite>(`/favorites/${productId}`);
  return res.data;
}

export async function removeFavorite(productId: number) {
  const res = await api.delete<{ message: string }>(`/favorites/${productId}`);
  return res.data;
}


