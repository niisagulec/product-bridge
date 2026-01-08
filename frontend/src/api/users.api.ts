import api from './axios';
import type { User } from '../types/user';

export async function listUsers() {
  const res = await api.get<User[]>('/users');
  return res.data;
}


