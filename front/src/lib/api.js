import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://kontrast-shop.ru/api/",
});

// Улучшенная функция получения CSRF токена
const getCSRFToken = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return value;
    }
  }
  return null;
};

// Флаг для отслеживания первой загрузки
let isFirstLoad = true;

api.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken();
  
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  } else if (isFirstLoad) {
    isFirstLoad = false;
  }
  
  config.withCredentials = true;
  return config;
});

api.interceptors.response.use(
  (response) => {
    // После первого успешного ответа проверяем CSRF токен
    if (isFirstLoad) {
      const csrfToken = getCSRFToken();
      isFirstLoad = false;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      
      // Проверяем текущий токен
      const currentToken = getCSRFToken();
      
      // Если токен есть, но ошибка - возможно нужна перезагрузка
      if (currentToken) {
      }
    }
    return Promise.reject(error);
  }
);

// Убираем initializeCSRF - он больше не нужен
export const checkCSRFStatus = () => {
  const token = getCSRFToken();
  return {
    hasToken: !!token,
    token: token ? `${token.substring(0, 10)}...` : null
  };
};

// Экспортируем методы для работы с API
export const productAPI = {
  getProducts: () => api.get("/products/"),
  getProduct: (id) => api.get(`/products/${id}/`),
};

export const cartApi = {
  add: (productId, quantity = 1) => api.post(`/cart/add/${productId}/`, { quantity }),
  remove: (productId) => api.post(`/cart/remove/${productId}/`),
  update: (productId, quantity) => api.post(`/cart/update/${productId}/`, { quantity }),
  clear: () => api.post("/cart/clear/"),
  detail: () => api.get("/cart/detail/"),
};

export const orderAPI = {
  createOrder: (data) => api.post("/orders/create/", data),
  createCustomOrder: (data) => api.post("/orders/create-custom/", data),
};

export const authApi = {
  me: () => api.get("/auth/me/"),
  register: (data) => api.post("/auth/register/", data),
  login: (data) => api.post("/auth/login/", data),
  logout: () => api.post("/auth/logout/"),
};
