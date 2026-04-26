import axios from 'axios';
import axiosClient from './axiosClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const loginUser = (credentials) =>
  axios.post(`${API_BASE}/users/login/`, credentials);

export const registerUser = (data) =>
  axios.post(`${API_BASE}/users/register/`, data);

export const logoutUser = (refreshToken) =>
  axiosClient.post('/users/logout/', { refresh: refreshToken });

export const getProfile = () =>
  axiosClient.get('/users/profile/');

export const updateProfile = (data) =>
  axiosClient.put('/users/profile/', data);
