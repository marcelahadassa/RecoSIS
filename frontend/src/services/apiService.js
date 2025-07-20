import axios from 'axios';

// a URL base da API que tá no docker
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// função que adiciona o token de autenticação em cada requisição
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('recosis-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// funções para cada endpoint da API
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const loginUser = (userData) => apiClient.post('/auth/login', userData);
export const getProfile = () => apiClient.get('/auth/me');
export const requestRecommendations = (lastfmUsername) => apiClient.post('/recommendations', { lastfm_username: lastfmUsername });

// função para buscar os resultados
export const getRecommendations = () => apiClient.get('/recommendations');