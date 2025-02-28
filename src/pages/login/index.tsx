import { View } from '@tarojs/components'
import { Form, Input, Button } from '@nutui/nutui-react-taro'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store'
import request from '@/utils/request'
import './index.scss'

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const { setToken, setUserInfo } = useAuthStore()

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await request.post('/auth/login', values)
      const { token, points, userType, userId } = response.data;
      setToken(token)
      setUserInfo({
        id: userId,
        username: values.username,
        userType,
        points,
      })
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
      })
      if (userType === 'admin') {
        Taro.redirectTo({
          url: '/pages/admin/index'
        })
      } else {
        Taro.switchTab({
          url: '/pages/home/index',
        })
      }
    } catch (error) {
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login-page'>
      <View className='login-container'>
        <View className='login-title'>ChildPVP</View>
        <View className='login-subtitle'>用游戏化的方式激励您的孩子不断进步！</View>
        <Form onFinish={onSubmit}>
          <Form.Item
            label='用户名'
            name='username'
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              className='login-input'
              placeholder='请输入用户名'
              type='text'
            />
          </Form.Item>
          <Form.Item
            label='密码'
            name='password'
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input
              className='login-input'
              placeholder='请输入密码'
              type='password'
            />
          </Form.Item>
          <Form.Item>
            <Button
              block
              type='primary'
              formType='submit'
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <View className='login-footer'>
          <View
            className='register-link'
            onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}
          >
            还没有账号？立即注册
          </View>
        </View>
      </View>
    </View>
  )
}

export default LoginPage 