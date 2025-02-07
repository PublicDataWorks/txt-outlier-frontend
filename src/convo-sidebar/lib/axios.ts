import type { AxiosError, AxiosResponse } from 'axios';
import Axios from 'axios'
import { LOGOUT_PATH } from '../constants/routes'

const axios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL as string
})

axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // HashRouter due to hosting on S3
      window.location.href = `#${LOGOUT_PATH}`;
    }
    return Promise.reject(error);
  }
);

export default axios
