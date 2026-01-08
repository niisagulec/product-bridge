import api from './axios';
import type { Product } from '../types/product';

export async function listProducts(params?: { typeId?: number }) {
  const res = await api.get<Product[]>('/products', { params });
  return res.data;
}

export async function searchProducts(params: { q: string; typeId?: number }) {
  const res = await api.get<Product[]>('/products/search', { params });
  return res.data;
}

export async function createProduct(payload: { name: string; productType?: number; brandId?: number }) {
  const res = await api.post<Product>('/products', payload);
  return res.data;
}

export async function deleteProduct(id: number) {
  const res = await api.delete<{ message: string }>(`/products/${id}`);
  return res.data;
}


