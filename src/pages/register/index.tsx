import { View } from '@tarojs/components'
import { Form, Input, Button, Radio } from '@nutui/nutui-react-taro'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import request from '@/utils/request'
import './index.scss'

type UserType = 'parent' | 'child' | 'admin'

interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  userType: UserType
  inviteCode?: string
}

const RegisterPage = () => {
  const [loading, setLoading] = useState(false)
  const [showInviteCode, setShowInviteCode] = useState(false)
  const [form] = Form.useForm()

  const userTypeOptions = [
    {
      value: 'child' as UserType,
      label: '孩子',
      description: ''
    },
    {
      value: 'parent' as UserType,
      label: '家长',
      description: ''
    },
    {
      value: 'admin' as UserType,
      label: '管理员',
      description: ''
    }
  ]

  const onUserTypeChange = (value: string | number) => {
    const userType = value as UserType
    setShowInviteCode(userType === 'admin')
    form.setFieldValue('userType', [userType])
  }

  const onSubmit = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      Taro.showToast({
        title: '两次输入的密码不一致',
        icon: 'error',
      })
      return
    }

    const userType = values.userType
    
    // 如果是管理员注册，验证邀请码
    if (userType === 'admin' && values.inviteCode !== 'admin123') {
      Taro.showToast({
        title: '邀请码无效',
        icon: 'error',
      })
      return
    }

    try {
      setLoading(true)
      const response = await request.post('/auth/register', {
        username: values.username,
        password: values.password,
        userType
      })

      if (response.status === 201) {
        Taro.showToast({
          title: '注册成功',
          icon: 'success',
        })
        Taro.navigateTo({ url: '/pages/login/index' })
      }
    } catch (error: any) {
      Taro.showToast({
        title: error.response?.data?.message || '注册失败',
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='register-page'>
      <View className='register-container'>
        <View className='register-title'>注册账号</View>
        <View className='register-subtitle'>加入ChildPVP，开启游戏化学习之旅！</View>
        <Form 
          form={form} 
          onFinish={onSubmit}
          initialValues={{
            userType: ['child']
          }}
        >
          <Form.Item
            label='用户名'
            name='username'
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              className='register-input'
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
              className='register-input'
              placeholder='请输入密码'
              type='password'
            />
          </Form.Item>
          <Form.Item
            label='确认密码'
            name='confirmPassword'
            rules={[{ required: true, message: '请再次输入密码' }]}
          >
            <Input
              className='register-input'
              placeholder='请再次输入密码'
              type='password'
            />
          </Form.Item>
          <Form.Item
            label='我是'
            name='userType'
            rules={[{ required: true, message: '请选择用户类型' }]}
          >
            <Radio.Group onChange={onUserTypeChange}>
              {userTypeOptions.map(option => (
                <Radio 
                  key={option.value} 
                  value={option.value}
                  className='user-type-radio'
                >
                  <View className='user-type-option'>
                    <View className='user-type-label'>{option.label}</View>
                    <View className='user-type-desc'>{option.description}</View>
                  </View>
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          {showInviteCode && (
            <Form.Item
              label='邀请码'
              name='inviteCode'
              rules={[{ required: true, message: '请输入管理员邀请码' }]}
            >
              <Input
                className='register-input'
                placeholder='请输入邀请码'
                type='text'
              />
            </Form.Item>
          )}
          <Form.Item>
            <Button
              block
              type='primary'
              formType='submit'
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
        <View className='register-footer'>
          <View
            className='login-link'
            onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
          >
            已有账号？立即登录
          </View>
        </View>
      </View>
    </View>
  )
}

export default RegisterPage 