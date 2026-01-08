import api from './axios';
import type { ProductPlatform } from '../types/product';

export async function createProductPlatform(payload: {
  productId: number;
  platformId: number;
  price: number;
  url: string;
}) {
  const res = await api.post<ProductPlatform>('/product-platforms', payload);
  return res.data;
}

export async function updateProductPlatform(
  id: number,
  payload: { platformId?: number; price?: number; url?: string },
) {
  const res = await api.put<ProductPlatform>(`/product-platforms/${id}`, payload);
  return res.data;
}

export async function deleteProductPlatform(id: number) {
  const res = await api.delete<{ message: string }>(`/product-platforms/${id}`);
  return res.data;
}


