const baseUrl = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name, email, password) =>
    request('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getProducts: () => request('/products'),
  getNotifications: () => request('/products'),

  createProduct: (body) =>
    request('/products', { method: 'POST', body: JSON.stringify(body) }),

  updateProduct: (id, body) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  stockIn: (productId, quantity) =>
    request('/inventory/stock-in', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  stockOut: (productId, quantity) =>
    request('/inventory/stock-out', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  getLogs: () => request('/inventory/logs'),

  getStockUpdates: () => request('/stock-updates'),

  createOrder: (items) =>
    request('/orders', { method: 'POST', body: JSON.stringify({ items }) }),

  getOrders: () => request('/orders'),
};
