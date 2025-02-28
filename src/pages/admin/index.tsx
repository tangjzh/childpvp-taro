import { View } from '@tarojs/components'
import { Tabs, Button } from '@nutui/nutui-react-taro'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store'
import Layout from '@/components/Layout'
import UserManagement from './components/UserManagement'
import GroupManagement from './components/GroupManagement'
import './index.scss'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('1')
  const { userInfo } = useAuthStore()

  useEffect(() => {
    // 检查是否是管理员
    if (!userInfo || userInfo.userType !== 'admin') {
      Taro.showToast({
        title: '无权限访问',
        icon: 'error',
      })
      // 延迟跳转，确保提示显示
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/home/index',
        })
      }, 1500)
    }
  }, [userInfo])

  const tabs = [
    { title: '用户管理', value: '1' },
    { title: '家庭组管理', value: '2' },
  ]

  const renderContent = () => {
    if (!userInfo || userInfo.userType !== 'admin') {
      return null
    }

    switch (activeTab) {
      case '1':
        return <UserManagement />
      case '2':
        return <GroupManagement />
      default:
        return null
    }
  }

  // 如果不是管理员，不渲染内容
  if (!userInfo || userInfo.userType !== 'admin') {
    return null
  }

  return (
    <Layout title='管理后台'>
      <View className='admin-page'>
        <View className='admin-header'>
          <View className='admin-title'>管理员：{userInfo.username}</View>
          <Button 
            type='danger'
            size='small'
            onClick={() => {
              useAuthStore.getState().logout()
            }}
          >
            退出登录
          </Button>
        </View>
        <Tabs
          value={activeTab}
          onChange={value => setActiveTab(String(value))}
          className='admin-tabs'
        >
          {tabs.map(tab => (
            <Tabs.TabPane
              key={tab.value}
              title={tab.title}
              value={tab.value}
            />
          ))}
        </Tabs>
        <View className='admin-content'>
          {renderContent()}
        </View>
      </View>
    </Layout>
  )
}

export default AdminPage 