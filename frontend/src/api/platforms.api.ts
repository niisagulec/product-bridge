import api from './axios';
import type { Platform } from '../types/product';

export async function listPlatforms() {
  const res = await api.get<Platform[]>('/platforms');
  return res.data;
}

export async function createPlatform(payload: { name: string }) {
  const res = await api.post<Platform>('/platforms', payload);
  return res.data;
}


