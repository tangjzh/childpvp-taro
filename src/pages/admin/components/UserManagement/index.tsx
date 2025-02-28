import { View } from '@tarojs/components'
import { Button, Dialog } from '@nutui/nutui-react-taro'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store'
import Empty from '@/components/Empty'
import request from '@/utils/request'
import { formatDate } from '@/utils/helper'
import './index.scss'

interface User {
  id: number
  username: string
  userType: 'admin' | 'parent' | 'child'
  points: number
  createdAt: string
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const { userInfo } = useAuthStore()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await request.get<User[]>('/users')
      setUsers(data)
    } catch (error) {
      Taro.showToast({
        title: '获取用户列表失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetRole = async (userId: number, userType: 'admin' | 'parent' | 'child') => {
    Dialog.open('set-role-dialog', {
      title: '设置用户角色',
      content: `确定要将该用户设置为${userType === 'admin' ? '管理员' : userType === 'parent' ? '家长' : '孩子'}吗？`,
      onConfirm: async () => {
        try {
          await request.put(`/users/set-role/${userId}`, { userType })
          setUsers(users.map(user => 
            user.id === userId ? { ...user, userType } : user
          ))
          Taro.showToast({
            title: '设置成功',
            icon: 'success'
          })
        } catch (error) {
          Taro.showToast({
            title: '设置失败',
            icon: 'error'
          })
        }
        Dialog.close('set-role-dialog')
      },
      onCancel: () => {
        Dialog.close('set-role-dialog')
      }
    })
  }

  const handleResetPoints = async (userId: number) => {
    Dialog.open('reset-points-dialog', {
      title: '重置积分',
      content: '确定要重置该用户的积分吗？',
      onConfirm: async () => {
        try {
          await request.post(`/users/set-points/${userId}`, { points: 0 })
          setUsers(users.map(user => 
            user.id === userId ? { ...user, points: 0 } : user
          ))
          Taro.showToast({
            title: '重置成功',
            icon: 'success'
          })
        } catch (error) {
          Taro.showToast({
            title: '重置失败',
            icon: 'error'
          })
        }
        Dialog.close('reset-points-dialog')
      },
      onCancel: () => {
        Dialog.close('reset-points-dialog')
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

  return (
    <View className='user-management'>
      {users.length === 0 ? (
        <Empty text='暂无用户' />
      ) : (
        <View className='user-list'>
          {users.map(user => (
            <View key={user.id} className='user-item'>
              <View className='user-info'>
                <View className='username'>{user.username}</View>
                <View className='user-meta'>
                  <View className='role'>角色：{getUserTypeText(user.userType)}</View>
                  <View className='points'>积分：{user.points}</View>
                  <View className='created-time'>
                    注册时间：{formatDate(user.createdAt)}
                  </View>
                </View>
              </View>
              <View className='user-actions'>
                {user.userType !== 'admin' && (
                  <Button
                    type='primary'
                    size='small'
                    className='action-button'
                    onClick={() => handleSetRole(user.id, 'admin')}
                  >
                    设为管理员
                  </Button>
                )}
                {user.userType !== 'parent' && (
                  <Button
                    type='success'
                    size='small'
                    className='action-button'
                    onClick={() => handleSetRole(user.id, 'parent')}
                  >
                    设为家长
                  </Button>
                )}
                {user.userType !== 'child' && (
                  <Button
                    type='warning'
                    size='small'
                    className='action-button'
                    onClick={() => handleSetRole(user.id, 'child')}
                  >
                    设为孩子
                  </Button>
                )}
                <Button
                  type='danger'
                  size='small'
                  className='action-button'
                  onClick={() => handleResetPoints(user.id)}
                >
                  重置积分
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 确认弹窗 */}
      <Dialog 
        id='set-role-dialog' 
        closeOnOverlayClick
        onClose={() => Dialog.close('set-role-dialog')}
      />
      <Dialog 
        id='reset-points-dialog' 
        closeOnOverlayClick
        onClose={() => Dialog.close('reset-points-dialog')}
      />
    </View>
  )
}

export default UserManagement 