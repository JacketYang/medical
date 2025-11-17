/**
 * API服务封装
 * 统一处理所有与后端的通信，包括认证、错误处理等
 */

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 用户类型
export interface User {
  id: number;
  username: string;
  role: string;
}

// 产品类型
export interface Product {
  id: number;
  slug: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  specs: Record<string, any>;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// 文章类型
export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  status: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// 站点设置类型
export interface SiteSettings {
  [key: string]: {
    value: string;
    description: string;
  };
}

// 上传文件类型
export interface UploadFile {
  id: number;
  filename: string;
  original_name: string;
  content_type: string;
  size: number;
  url: string;
  created_at: string;
}

// 上传URL响应类型
export interface UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  filename: string;
  expiresIn: number;
}

// 获取认证token
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// 设置认证token
const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// 清除认证token
const clearToken = (): void => {
  localStorage.removeItem('auth_token');
};

// 创建请求头
const createHeaders = (includeAuth: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// 通用请求函数
const request = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = createHeaders(includeAuth);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    // 如果token过期，清除本地存储并跳转到登录页
    if (response.status === 401 && window.location.pathname !== '/admin/login') {
      clearToken();
      window.location.href = '/admin/login';
      return data;
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// 认证相关API
export const authApi = {
  // 登录
  login: async (username: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, false);

    if (response.success && response.data?.token) {
      setToken(response.data.token);
    }

    return response;
  },

  // 验证token
  verify: async (): Promise<ApiResponse<{ user: User }>> => {
    return request('/auth/verify', {
      method: 'POST',
    });
  },

  // 刷新token
  refresh: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.data?.token) {
      setToken(response.data.token);
    }

    return response;
  },

  // 登出
  logout: (): void => {
    clearToken();
    window.location.href = '/admin/login';
  },
};

// 产品相关API
export const productsApi = {
  // 获取产品列表
  getProducts: async (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    category?: string;
  }): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.q) searchParams.append('q', params.q);
    if (params?.category) searchParams.append('category', params.category);

    const query = searchParams.toString();
    return request<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ''}`, {}, false);
  },

  // 获取单个产品
  getProduct: async (id: string | number): Promise<ApiResponse<Product>> => {
    return request<Product>(`/products/${id}`, {}, false);
  },

  // 创建产品
  createProduct: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    return request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  // 更新产品
  updateProduct: async (id: string | number, product: Partial<Product>): Promise<ApiResponse<Product>> => {
    return request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  // 删除产品
  deleteProduct: async (id: string | number): Promise<ApiResponse> => {
    return request(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// 文章相关API
export const postsApi = {
  // 获取文章列表
  getPosts: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    return request<PaginatedResponse<Post>>(`/posts${query ? `?${query}` : ''}`, {}, false);
  },

  // 获取单篇文章
  getPost: async (id: string | number): Promise<ApiResponse<Post>> => {
    return request<Post>(`/posts/${id}`, {}, false);
  },

  // 创建文章
  createPost: async (post: Partial<Post>): Promise<ApiResponse<Post>> => {
    return request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  },

  // 更新文章
  updatePost: async (id: string | number, post: Partial<Post>): Promise<ApiResponse<Post>> => {
    return request<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    });
  },

  // 删除文章
  deletePost: async (id: string | number): Promise<ApiResponse> => {
    return request(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};

// 站点设置相关API
export const settingsApi = {
  // 获取所有设置
  getSettings: async (keys?: string): Promise<ApiResponse<SiteSettings>> => {
    const query = keys ? `?keys=${encodeURIComponent(keys)}` : '';
    return request<SiteSettings>(`/settings${query}`, {}, false);
  },

  // 获取单个设置
  getSetting: async (key: string): Promise<ApiResponse<{ key: string; value: string; description: string }>> => {
    return request(`/settings/${key}`, {}, false);
  },

  // 更新设置
  updateSetting: async (key: string, value: string, description?: string): Promise<ApiResponse> => {
    return request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  },

  // 批量更新设置
  updateSettings: async (settings: Record<string, string>): Promise<ApiResponse> => {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  },
};

// 文件上传相关API
export const uploadApi = {
  // 获取预签名上传URL
  getUploadUrl: async (filename: string, contentType: string, size?: number): Promise<ApiResponse<UploadUrlResponse>> => {
    return request<UploadUrlResponse>('/upload/url', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType, size }),
    });
  },

  // 直接上传文件
  uploadFile: async (file: File): Promise<ApiResponse<UploadFile>> => {
    const formData = new FormData();
    formData.append('file', file);

    return request<UploadFile>('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器自动设置Content-Type
    });
  },

  // 获取上传文件列表
  getUploads: async (page: number = 1, pageSize: number = 20): Promise<ApiResponse<PaginatedResponse<UploadFile>>> => {
    return request<PaginatedResponse<UploadFile>>(`/upload/uploads?page=${page}&pageSize=${pageSize}`);
  },

  // 删除上传文件
  deleteUpload: async (id: number): Promise<ApiResponse> => {
    return request(`/upload/uploads/${id}`, {
      method: 'DELETE',
    });
  },
};

// 导出默认配置
export default {
  API_BASE_URL,
  getToken,
  setToken,
  clearToken,
};