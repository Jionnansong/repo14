import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request Interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const res = error.response;
    
    if (res) {
      // 401: Unauthorized (expired or invalid token)
      if (res.status === 401) {
        ElMessage.error(res.data.message || '凭证无效或已过期，请重新登录。');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      } 
      // 403: Forbidden (forbidden roles or inactive accounts)
      else if (res.status === 403) {
        ElMessage.error(res.data.message || '您没有权限进行此操作。');
        
        if (res.data.message && res.data.message.includes('停用')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      } 
      // Other error status codes
      else {
        ElMessage.error(res.data.message || '服务器处理错误。');
      }
    } else {
      ElMessage.error('无法连接至服务器，请检查您的网络连接。');
    }
    
    return Promise.reject(error);
  }
);

export default request;
