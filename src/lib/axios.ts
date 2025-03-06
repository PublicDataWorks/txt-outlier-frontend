import axios, { AxiosError, AxiosResponse } from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL
});

axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('===== Error 401, reloading');
      localStorage.removeItem('token');
      Missive.reload();
}
    return Promise.reject(error);
  }
);

export default instance;
