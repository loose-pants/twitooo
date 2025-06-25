const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('twittoo_token');
  
  const config: RequestInit = {
    headers: {
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'An error occurred', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error or server unavailable', 500);
  }
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

// Tweets API
export const tweetsApi = {
  getAll: () => apiRequest('/tweets'),
  
  getById: (id: number) => apiRequest(`/tweets/${id}`),
  
  create: (content: string) =>
    apiRequest('/tweets', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  createWithImages: (formData: FormData) =>
    apiRequest('/tweets', {
      method: 'POST',
      body: formData,
    }),
  
  update: (id: number, content: string) =>
    apiRequest(`/tweets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
  
  delete: (id: number) =>
    apiRequest(`/tweets/${id}`, {
      method: 'DELETE',
    }),

  like: (id: number) =>
    apiRequest(`/tweets/${id}/like`, {
      method: 'POST',
    }),

  retweet: (id: number) =>
    apiRequest(`/tweets/${id}/retweet`, {
      method: 'POST',
    }),

  reply: (id: number, content: string) =>
    apiRequest(`/tweets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest('/users'),
  
  getById: (id: number) => apiRequest(`/users/${id}`),

  getProfile: (username: string) => apiRequest(`/users/profile/${username}`),

  follow: (id: number) =>
    apiRequest(`/users/${id}/follow`, {
      method: 'POST',
    }),
  
  updateRole: (id: number, role: string) =>
    apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  
  delete: (id: number) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiError };