import { View } from '@tarojs/components'
import { Form, Button, Radio } from '@nutui/nutui-react-taro'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store'
import Layout from '@/components/Layout'
import FormItem from '@/components/FormItem'
import request from '@/utils/request'
import './index.scss'

interface Child {
  id: number
  username: string
}

interface CreateTaskForm {
  childId: number
  title: string
  points: number
}

const CreateTaskPage = () => {
  const [loading, setLoading] = useState(false)
  const [children, setChildren] = useState<Child[]>([])
  const { userInfo } = useAuthStore()
  const [form] = Form.useForm()

  useEffect(() => {
    // 如果用户不是家长，重定向到首页
    if (userInfo?.userType !== 'parent') {
      Taro.showToast({
        title: '只有家长可以创建任务',
        icon: 'error'
      })
      Taro.switchTab({ url: '/pages/home/index' })
      return
    }

    fetchChildren()
  }, [userInfo])

  const fetchChildren = async () => {
    try {
      const { data } = await request.get<Child[]>('/users/children')
      setChildren(data)
      if (data.length > 0) {
        form.setFieldValue('childId', String(data[0].id))
      } else {
        Taro.showToast({
          title: '您还没有任何同组的孩子',
          icon: 'error'
        })
        Taro.switchTab({ url: '/pages/home/index' })
      }
    } catch (error) {
      console.error('获取孩子列表失败:', error)
      Taro.showToast({
        title: '获取孩子列表失败',
        icon: 'error'
      })
      Taro.switchTab({ url: '/pages/home/index' })
    }
  }

  const onSubmit = async (values: CreateTaskForm) => {
    try {
      setLoading(true)
      await request.post('/tasks', {
        title: values.title,
        points: values.points,
        childId: Number(values.childId)
      })
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })
      // 返回上一页
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      Taro.showToast({
        title: '创建失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title='新增任务'>
      <View className='create-task-page'>
        <View className='form-container'>
          <View className='form-title'>任务信息</View>
          <Form 
            form={form}
            onFinish={onSubmit}
            footer={
              <Button 
                block 
                type='primary' 
                formType='submit'
                loading={loading}
              >
                创建任务
              </Button>
            }
          >
            <FormItem
              label='选择孩子'
              name='childId'
              required
            >
              <Radio.Group>
                {children.map(child => (
                  <Radio 
                    key={child.id} 
                    value={String(child.id)}
                  >
                    {child.username}
                  </Radio>
                ))}
              </Radio.Group>
            </FormItem>
            <FormItem
              label='任务名称'
              name='title'
              type='text'
              required
              placeholder='请输入任务名称'
              onChange={(value) => form.setFieldValue('title', value)}
            />
            <FormItem
              label='任务积分'
              name='points'
              type='number'
              required
              placeholder='请输入可得积分'
              onChange={(value) => form.setFieldValue('points', value)}
            />
          </Form>
        </View>
      </View>
    </Layout>
  )
}

export default CreateTaskPage 