import { defineStore } from 'pinia';
import request from '../utils/request';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user && state.user.role === 'Admin',
  },
  actions: {
    async login(username, password) {
      this.loading = true;
      try {
        const res = await request.post('/auth/login', { username, password });
        if (res.success) {
          this.token = res.data.token;
          this.user = res.data.user;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          return { success: true, message: res.message };
        }
        return { success: false, message: res.message || '登录失败' };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || '网络请求错误' };
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    async fetchMe() {
      try {
        const res = await request.get('/auth/me');
        if (res.success) {
          this.user = res.data;
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (error) {
        // Automatically handled by request interceptors (401 redirect)
      }
    }
  },
});
