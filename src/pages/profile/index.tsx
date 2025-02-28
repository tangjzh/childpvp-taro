import { View } from '@tarojs/components'
import { Avatar, Cell, Button, Dialog } from '@nutui/nutui-react-taro'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store'
import Layout from '@/components/Layout'
import request from '@/utils/request'
import './index.scss'

const ProfilePage = () => {
  const { userInfo, logout } = useAuthStore()
  const [stats, setStats] = useState({
    ongoingTasks: 0,
    availableRewards: 0
  })

  // 获取统计数据
  const fetchStats = async () => {
    if (userInfo?.userType !== 'child') return
    
    try {
      const [tasksRes, rewardsRes] = await Promise.all([
        request.get('/tasks'),
        request.get('/rewards')
      ])
      
      const ongoingTasks = tasksRes.data.filter(task => !task.completed).length
      const availableRewards = rewardsRes.data.filter(reward => 
        !reward.redeemed && userInfo.points >= reward.points
      ).length

      setStats({
        ongoingTasks,
        availableRewards
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 页面显示时检查登录状态并获取统计数据
  useDidShow(() => {
    if (!userInfo) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchStats()
  })

  const handleLogout = () => {
    Dialog.open('logout-dialog', {
      title: '退出登录',
      content: '确定要退出登录吗？',
      onConfirm: () => {
        Dialog.close('logout-dialog')
        logout()
      },
      onCancel: () => {
        Dialog.close('logout-dialog')
      }
    })
  }

  const getUserTypeText = (userType: string) => {
    switch (userType) {
      case 'admin':
        return '管理员'
      case 'parent':
        return '家长'
      case 'child':
        return '孩子'
      default:
        return '未知'
    }
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return '👨‍💼'
      case 'parent':
        return '👨‍👩‍👧‍👦'
      case 'child':
        return '👶'
      default:
        return '👤'
    }
  }

  return (
    <Layout>
      <View className='profile-page'>
        {/* 用户信息卡片 */}
        <View className='user-card'>
          <View className='card-background'>
            <View className='background-pattern' />
          </View>
          <View className='user-info'>
            <View className='avatar-wrapper'>
              <Avatar 
                size='large' 
                src={userInfo?.avatar}
                className='avatar'
              >
                {userInfo?.username?.[0]?.toUpperCase()}
              </Avatar>
              <View className='user-type-badge'>
                {getUserTypeIcon(userInfo?.userType || '')}
              </View>
            </View>
            <View className='user-details'>
              <View className='username'>{userInfo?.username}</View>
              <View className='user-type'>{getUserTypeText(userInfo?.userType || '')}</View>
            </View>
          </View>
          <View className='user-stats'>
            <View className='stat-item'>
              <View className='stat-value'>{userInfo?.points || 0}</View>
              <View className='stat-label'>我的积分</View>
            </View>
            {userInfo?.userType === 'child' && (
              <>
                <View className='stat-divider' />
                <View className='stat-item'>
                  <View className='stat-value'>{stats.ongoingTasks}</View>
                  <View className='stat-label'>进行中任务</View>
                </View>
                <View className='stat-divider' />
                <View className='stat-item'>
                  <View className='stat-value'>{stats.availableRewards}</View>
                  <View className='stat-label'>可用奖励</View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 功能列表 */}
        <View className='function-list'>
          <Cell.Group>
            {userInfo?.userType === 'admin' && (
              <Cell
                title='管理后台'
                description='系统管理与配置'
                onClick={() => Taro.navigateTo({ url: '/pages/admin/index' })}
                align='center'
                extra={<View className='cell-arrow'>👉</View>}
              />
            )}
            <Cell
              title='我的任务'
              description={userInfo?.userType === 'parent' ? '管理孩子的任务' : '查看我的任务进度'}
              onClick={() => Taro.switchTab({ url: '/pages/task/index' })}
              align='center'
              extra={<View className='cell-arrow'>👉</View>}
            />
            <Cell
              title='我的奖励'
              description={userInfo?.userType === 'parent' ? '管理奖励项目' : '查看可兑换的奖励'}
              onClick={() => Taro.switchTab({ url: '/pages/reward/index' })}
              align='center'
              extra={<View className='cell-arrow'>👉</View>}
            />
          </Cell.Group>
        </View>

        {/* 退出登录按钮 */}
        <View className='action-buttons'>
          <Button
            block
            type='danger'
            onClick={handleLogout}
            className='logout-button'
          >
            退出登录
          </Button>
        </View>

        {/* 退出登录确认弹窗 */}
        <Dialog id='logout-dialog' />
      </View>
    </Layout>
  )
}

export default ProfilePage 