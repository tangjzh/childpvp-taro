import { View } from '@tarojs/components'
import { Card, Avatar, Tag, Progress, Button } from '@nutui/nutui-react-taro'
import { useEffect, useCallback } from 'react'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useAuthStore, useTaskStore, useRewardStore } from '@/store'
import Layout from '@/components/Layout'
import request from '@/utils/request'
import './index.scss'

const HomePage = () => {
  const userInfo = useAuthStore((state) => state.userInfo)
  const { tasks, setTasks } = useTaskStore()
  const { rewards, setRewards } = useRewardStore()

  // 获取任务列表
  const fetchTasks = useCallback(async () => {
    try {
      const response = await request.get('/tasks')
      const data = response.data;
      setTasks(data)
    } catch (error) {
      console.error('获取任务列表失败:', error)
    }
  }, [setTasks])

  // 获取奖励列表
  const fetchRewards = useCallback(async () => {
    try {
      const response = await request.get('/rewards')
      const data = response.data;
      setRewards(data)
    } catch (error) {
      console.error('获取奖励列表失败:', error)
    }
  }, [setRewards])

  // 页面首次加载
  useEffect(() => {
    fetchTasks()
    fetchRewards()
  }, [fetchTasks, fetchRewards])
  
  // 页面显示时刷新数据
  useDidShow(() => {
    fetchTasks()
    fetchRewards()
  })

  const renderParentContent = () => {
    return (
      <View className='parent-actions'>
        <Button 
          block 
          type='primary'
          className='action-button create-task'
          onClick={() => Taro.navigateTo({ url: '/pages/task/create/index' })}
        >
          新增任务
        </Button>
        <Button 
          block 
          type='success'
          className='action-button create-reward'
          onClick={() => Taro.navigateTo({ url: '/pages/reward/create/index' })}
        >
          新增奖励
        </Button>
      </View>
    )
  }

  const renderChildContent = () => {
    return (
      <>
        {/* 进行中的任务 */}
        <View className='section-title'>进行中的任务</View>
        <View className='task-list'>
          {tasks.filter(task => !task.completed).length === 0 ? (
            <View className='empty-tip' style={{ textAlign: 'center' }}>暂无进行中的任务</View>
          ) : (
            tasks.filter(task => !task.completed).map(task => (
              <View
                key={task.id}
                className='task-card'
              >
                <View className='task-header'>
                  <View className='task-title'>{task.title}</View>
                  <View className='points-tag'>{task.points}</View>
                </View>
              </View>
            ))
          )}
        </View>
      </>
    )
  }

  const getGreeting = () => {
    const now = new Date()
    const hours = now.getHours()
    if (hours < 12) return '早上好'
    if (hours < 18) return '下午好'
    return '晚上好'
  }

  return (
    <Layout title={`${getGreeting()}，${userInfo?.userType === 'child' ? '同学' : userInfo?.userType === 'parent' ? '家长' : '管理员'}`}>
      <View className='home-page'>
        {/* 用户信息卡片 */}
        <View className='user-card'>
          <View className='user-info'>
            <Avatar size='large' src={userInfo?.avatar} />
            <View className='user-details'>
              <View className='username'>{userInfo?.username}</View>
              {userInfo?.userType === 'child' && (
                <View className='points'>积分: {userInfo?.points}</View>
              )}
            </View>
          </View>
        </View>

        {/* 根据角色显示不同内容 */}
        {userInfo?.userType === 'parent' ? renderParentContent() : renderChildContent()}
      </View>
    </Layout>
  )
}

export default HomePage 