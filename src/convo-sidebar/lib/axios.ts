import type { AxiosError, AxiosResponse } from 'axios';
import Axios from 'axios'

const axios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL as string
})

axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token')
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default axios
