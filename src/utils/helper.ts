import Taro from '@tarojs/taro'
import dayjs from 'dayjs'

// 格式化日期
export const formatDate = (date: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).format(format)
}

// 格式化数字
export const formatNumber = (num: number) => {
  return num.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let previous = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - previous > wait) {
      func(...args)
      previous = now
    }
  }
}

// 复制文本
export const copyText = async (text: string) => {
  try {
    await Taro.setClipboardData({ data: text })
    Taro.showToast({
      title: '复制成功',
      icon: 'success',
    })
  } catch (error) {
    Taro.showToast({
      title: '复制失败',
      icon: 'error',
    })
  }
}

// 检查权限
export const checkPermission = (userRole: string, requiredRole: string) => {
  const roles = ['user', 'admin']
  const userRoleIndex = roles.indexOf(userRole)
  const requiredRoleIndex = roles.indexOf(requiredRole)
  return userRoleIndex >= requiredRoleIndex
}

// 生成随机ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  ) as T
}

// 获取文件扩展名
export const getFileExtension = (filename: string) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// 格式化文件大小
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// 检查是否为空对象
export const isEmptyObject = (obj: object) => {
  return Object.keys(obj).length === 0
}

// 获取URL参数
export const getUrlParams = (url: string) => {
  const params: Record<string, string> = {}
  new URL(url).searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

// 检查是否为手机号
export const isPhoneNumber = (phone: string) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 检查是否为邮箱
export const isEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 检查是否为身份证号
export const isIdCard = (idCard: string) => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
} 