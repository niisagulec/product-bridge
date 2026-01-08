import api from './axios';
import type { UserRole } from '../types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export const login = async (data: LoginPayload) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const register = async (data: RegisterPayload) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};
