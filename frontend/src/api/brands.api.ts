import api from './axios';
import type { Brand } from '../types/product';

export async function listBrands() {
  const res = await api.get<Brand[]>('/brands');
  return res.data;
}

export async function createBrand(payload: { name: string }) {
  const res = await api.post<Brand>('/brands', payload);
  return res.data;
}


