import Taro from '@tarojs/taro'
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/store'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : 'http://192.3.233.70:5000/api'

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    if (data.code === 401) {
      // token过期，清除token并跳转到登录页
      Taro.removeStorageSync('token')
      Taro.navigateTo({ url: '/pages/login/index' })
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      Taro.removeStorageSync('token')
      Taro.navigateTo({ url: '/pages/login/index' })
    }
    return Promise.reject(error)
  }
)

export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    instance.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    instance.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    instance.delete<T>(url, config),
}

export default request 