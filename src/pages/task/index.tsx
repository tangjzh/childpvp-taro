import { View } from '@tarojs/components'
import { Button, Tag, Dialog, Tabs } from '@nutui/nutui-react-taro'
import { useState, useEffect } from 'react'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store'
import Layout from '@/components/Layout'
import request from '@/utils/request'
import './index.scss'

interface Task {
  id: number
  title: string
  points: number
  completed: boolean
  childName?: string
  parentName?: string
}

const TaskPage = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('1')
  const { userInfo } = useAuthStore()

  useEffect(() => {
    fetchTasks()
  }, [])

  useDidShow(() => {
    fetchTasks()
  })

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await request.get('/tasks')
      setTasks(response.data)
    } catch (error) {
      console.error('获取任务列表失败:', error)
      Taro.showToast({
        title: '获取任务列表失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    try {
      setLoading(true)
      await request.put(`/tasks/${taskId}/complete`)
      // 更新任务状态
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      ))
      // 重新获取用户信息以更新积分
      const userResponse = await request.get(`/auth/user/${userInfo?.id}`)
      useAuthStore.setState(state => ({
        ...state,
        userInfo: {
          ...state.userInfo!,
          points: userResponse.data.points
        }
      }))
      Taro.showToast({
        title: '完成任务',
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '操作失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    Dialog.open('delete-task-dialog', {
      title: '删除任务',
      content: '确定要删除这个任务吗？',
      onConfirm: async () => {
        try {
          await request.delete(`/tasks/${taskId}`)
          setTasks(tasks.filter(task => task.id !== taskId))
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
        } catch (error) {
          Taro.showToast({
            title: '删除失败',
            icon: 'error'
          })
        }
        Dialog.close('delete-task-dialog')
      },
      onCancel: () => {
        Dialog.close('delete-task-dialog')
      }
    })
  }

  const confirmComplete = (task: Task) => {
    Dialog.open('complete-task-dialog', {
      title: '完成任务',
      content: `确定完成任务"${task.title}"吗？完成后将获得 ${task.points} 积分`,
      onConfirm: () => {
        handleCompleteTask(task.id)
        Dialog.close('complete-task-dialog')
      },
      onCancel: () => {
        Dialog.close('complete-task-dialog')
      }
    })
  }

  const renderTaskList = () => {
    const filteredTasks = tasks.filter(task => {
      if (activeTab === '1') return !task.completed
      if (activeTab === '2') return task.completed
      return true
    })

    if (filteredTasks.length === 0) {
      return (
        <View className='empty-tip'>
          <View className='empty-icon'>📝</View>
          <View className='empty-text'>
            {activeTab === '1' ? '暂无进行中的任务' : '暂无已完成的任务'}
          </View>
          {userInfo?.userType === 'parent' && (
            <Button
              type='primary'
              size='small'
              onClick={() => Taro.navigateTo({ url: '/pages/task/create/index' })}
            >
              创建新任务
            </Button>
          )}
        </View>
      )
    }

    return (
      <View className='task-list'>
        {filteredTasks.map(task => (
          <View
            key={task.id}
            className={`task-card ${task.completed ? 'completed' : ''}`}
          >
            <View className='task-header'>
              <View className='task-title'>{task.title}</View>
              <View className='task-status'>
              <View className='points-tag'>{task.points}</View>
              </View>
            </View>
            <View className='task-footer'>
              <View className='task-meta'>
                {userInfo?.userType === 'parent' ? (
                  <View className='child-name'>分配给：{task.childName}</View>
                ) : (
                  <View className='parent-name'>来自：{task.parentName}</View>
                )}
              </View>
              <View className='task-actions'>
                {userInfo?.userType === 'parent' ? (
                  <Button
                    type='danger'
                    size='small'
                    loading={loading}
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    删除
                  </Button>
                ) : userInfo?.userType === 'child' && !task.completed ? (
                  <Button
                    type='primary'
                    size='small'
                    loading={loading}
                    onClick={() => confirmComplete(task)}
                  >
                    完成任务
                  </Button>
                ) : null}
              </View>
            </View>
          </View>
        ))}
      </View>
    )
  }

  return (
    <Layout title='任务'>
      <View className='task-page'>
        <View className='task-filter'>
          <Tabs
            value={activeTab}
            onChange={value => setActiveTab(String(value))}
          >
            <Tabs.TabPane title='进行中' value='1' />
            <Tabs.TabPane title='已完成' value='2' />
          </Tabs>
        </View>

        {renderTaskList()}

        <Dialog
          id='delete-task-dialog'
          closeOnOverlayClick
          onClose={() => Dialog.close('delete-task-dialog')}
        />
        <Dialog
          id='complete-task-dialog'
          closeOnOverlayClick
          onClose={() => Dialog.close('complete-task-dialog')}
        />
      </View>
    </Layout>
  )
}

export default TaskPage 