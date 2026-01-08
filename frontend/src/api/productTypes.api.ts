import api from './axios';
import type { ProductType } from '../types/product';

export async function listProductTypes() {
  const res = await api.get<ProductType[]>('/product-types');
  return res.data;
}


