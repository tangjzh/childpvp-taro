import { View } from '@tarojs/components'
import { Button, Dialog, Form, Radio, SearchBar, Input, TextArea } from '@nutui/nutui-react-taro'
import { useState, useEffect } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import Empty from '@/components/Empty'  
import request from '@/utils/request'
import { formatDate } from '@/utils/helper'
import './index.scss'

interface Group {
  id: number
  name: string
  description: string
  parent_count: number
  child_count: number
  created_at: string
}

interface User {
  id: number
  username: string
  userType: 'parent' | 'child'
  joined_at?: string
  groups?: string[]
}

interface GroupFormValues {
  name: string
  description: string
}

const GroupManagement = () => {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [groupMembers, setGroupMembers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'parent' | 'child'>('all')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [groupForm] = Form.useForm()
  const [showMemberManagement, setShowMemberManagement] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  useDidShow(() => {
    fetchGroups()
  })

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup)
      fetchAvailableUsers()
    }
  }, [selectedGroup])

  const fetchGroups = async () => {
    try {
      const response = await request.get('/groups')
      setGroups(response.data)
    } catch (error) {
      Taro.showToast({
        title: '获取用户组失败',
        icon: 'error'
      })
    }
  }

  const fetchGroupMembers = async (groupId: number) => {
    try {
      const response = await request.get(`/groups/${groupId}/members`)
      setGroupMembers(response.data)
    } catch (error) {
      Taro.showToast({
        title: '获取组成员失败',
        icon: 'error'
      })
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const [usersResponse, groupsResponse] = await Promise.all([
        request.get('/users'),
        request.get('/groups')
      ])
      const users = usersResponse.data
      const groups = groupsResponse.data
      const usersWithGroups = await Promise.all(
        users.map(async (user: User) => {
          const userGroups = await Promise.all(
            groups.map(async (group: Group) => {
              try {
                const response = await request.get(`/groups/${group.id}/members`)
                const members = response.data
                return members.some((member: User) => member.id === user.id) ? group.name : null
              } catch (error) {
                return null
              }
            })
          )
          return {
            ...user,
            groups: userGroups.filter(Boolean)
          }
        })
      )
      setAvailableUsers(usersWithGroups)
    } catch (error) {
      Taro.showToast({
        title: '获取用户列表失败',
        icon: 'error'
      })
    }
  }

  const onCreateGroup = async (values: GroupFormValues) => {
    try {
      await request.post('/groups', values)
      Taro.showToast({
        title: '用户组创建成功',
        icon: 'success'
      })
      setShowCreateForm(false)
      groupForm.resetFields()
      fetchGroups()
    } catch (error) {
      Taro.showToast({
        title: '创建用户组失败',
        icon: 'error'
      })
    }
  }

  const handleDeleteGroup = async (groupId: number) => {
    Dialog.open('delete-group-dialog', {
      title: '确认删除',
      content: '确定要删除这个用户组吗？',
      footer: (
        <View className='dialog-footer'>
          <Button 
            type='default'
            onClick={() => Dialog.close('delete-group-dialog')}
          >
            取消
          </Button>
          <Button 
            type='danger'
            onClick={async () => {
              try {
                await request.delete(`/groups/${groupId}`)
                Taro.showToast({
                  title: '用户组删除成功',
                  icon: 'success'
                })
                setSelectedGroup(null)
                fetchGroups()
                Dialog.close('delete-group-dialog')
              } catch (error) {
                Taro.showToast({
                  title: '删除用户组失败',
                  icon: 'error'
                })
              }
            }}
          >
            确定
          </Button>
        </View>
      )
    })
  }

  const handleAddUserToGroup = async (userId: number) => {
    if (!selectedGroup) return
    try {
      await request.post(`/groups/${selectedGroup}/members`, { userId })
      Taro.showToast({
        title: '成功添加用户到组',
        icon: 'success'
      })
      fetchGroupMembers(selectedGroup)
      fetchAvailableUsers()
      fetchGroups()
    } catch (error) {
      Taro.showToast({
        title: '添加用户到组失败',
        icon: 'error'
      })
    }
  }

  const handleRemoveUserFromGroup = async (userId: number) => {
    if (!selectedGroup) return
    Dialog.open('remove-user-dialog', {
      title: '确认移除',
      content: '确定要从组中移除该用户吗？',
      onConfirm: async () => {
        try {
          await request.delete(`/groups/${selectedGroup}/members/${userId}`)
          Taro.showToast({
            title: '成功从组中移除用户',
            icon: 'success'
          })
          fetchGroupMembers(selectedGroup)
          fetchAvailableUsers()
          setSelectedUsers(selectedUsers.filter(id => id !== userId))
          fetchGroups()
        } catch (error) {
          Taro.showToast({
            title: '从组中移除用户失败',
            icon: 'error'
          })
        }
        Dialog.close('remove-user-dialog')
      },
      onCancel: () => {
        Dialog.close('remove-user-dialog')
      }
    })
  }

  const handleBatchAddUsers = async () => {
    if (!selectedGroup || selectedUsers.length === 0) return
    Dialog.open('batch-add-dialog', {
      title: '批量添加',
      content: `确定要添加选中的 ${selectedUsers.length} 个用户到组吗？`,
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedUsers.map(userId =>
              request.post(`/groups/${selectedGroup}/members`, { userId })
            )
          )
          Taro.showToast({
            title: '成功添加选中用户到组',
            icon: 'success'
          })
          fetchGroupMembers(selectedGroup)
          fetchAvailableUsers()
          setSelectedUsers([])
          fetchGroups()
        } catch (error) {
          Taro.showToast({
            title: '批量添加用户失败',
            icon: 'error'
          })
        }
        Dialog.close('batch-add-dialog')
      },
      onCancel: () => {
        Dialog.close('batch-add-dialog')
      }
    })
  }

  const handleBatchRemoveUsers = async () => {
    if (!selectedGroup || selectedUsers.length === 0) return
    Dialog.open('batch-remove-dialog', {
      title: '批量移除',
      content: `确定要从组中移除选中的 ${selectedUsers.length} 个用户吗？`,
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedUsers.map(userId =>
              request.delete(`/groups/${selectedGroup}/members/${userId}`)
            )
          )
          Taro.showToast({
            title: '成功从组中移除选中用户',
            icon: 'success'
          })
          fetchGroupMembers(selectedGroup)
          fetchAvailableUsers()
          setSelectedUsers([])
          fetchGroups()
        } catch (error) {
          Taro.showToast({
            title: '批量移除用户失败',
            icon: 'error'
          })
        }
        Dialog.close('batch-remove-dialog')
      },
      onCancel: () => {
        Dialog.close('batch-remove-dialog')
      }
    })
  }

  const renderGroupList = () => (
    <View className='group-list'>
      <Button
        type='primary'
        className='create-button'
        onClick={() => setShowCreateForm(true)}
      >
        创建用户组
      </Button>
      {groups.length === 0 ? (
        <Empty text='暂无用户组' />
      ) : (
        groups.map(group => (
          <View key={group.id} className='group-item'>
            <View className='group-info'>
              <View className='group-name'>{group.name}</View>
              <View className='group-meta'>
                <View className='description'>{group.description}</View>
                <View className='member-count'>
                  成员：{group.parent_count + group.child_count}人
                  （家长：{group.parent_count}，孩子：{group.child_count}）
                </View>
                <View className='created-time'>
                  创建时间：{formatDate(group.created_at)}
                </View>
              </View>
            </View>
            <View className='group-actions'>
              <Button
                type='primary'
                size='small'
                className='action-button'
                onClick={() => {
                  setSelectedGroup(group.id)
                  setShowMemberManagement(true)
                }}
              >
                管理成员
              </Button>
              <Button
                type='danger'
                size='small'
                className='action-button'
                onClick={() => handleDeleteGroup(group.id)}
              >
                删除
              </Button>
            </View>
          </View>
        ))
      )}
    </View>
  )

  const renderMemberManagement = () => {
    const currentGroup = groups.find(g => g.id === selectedGroup)
    if (!currentGroup) return null

    const filteredUsers = availableUsers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = userTypeFilter === 'all' || user.userType === userTypeFilter
      return matchesSearch && matchesType
    })

    return (
      <View className='member-management'>
        <View className='member-management-header'>
          <Button
            type='default'
            size='small'
            onClick={() => {
              setSelectedGroup(null)
              setShowMemberManagement(false)
            }}
          >
            返回
          </Button>
          <View className='group-title'>{currentGroup.name} - 成员管理</View>
        </View>

        <View className='search-section'>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='搜索用户名'
          />
          <Radio.Group 
            value={userTypeFilter} 
            onChange={(val: 'all' | 'parent' | 'child') => setUserTypeFilter(val)}
          >
            <Radio value='all'>全部</Radio>
            <Radio value='parent'>家长</Radio>
            <Radio value='child'>孩子</Radio>
          </Radio.Group>
        </View>

        <View className='member-section'>
          <View className='section-title'>当前成员</View>
          {groupMembers.length === 0 ? (
            <Empty text='暂无成员' />
          ) : (
            <>
              {selectedUsers.length > 0 && (
                <Button
                  type='danger'
                  size='small'
                  className='batch-action'
                  onClick={handleBatchRemoveUsers}
                >
                  批量移除
                </Button>
              )}
              <View className='member-list'>
                {groupMembers.map(member => (
                  <View key={member.id} className='member-item'>
                    <View className='member-info'>
                      <View className='username'>{member.username}</View>
                      <View className='user-type'>
                        {member.userType === 'parent' ? '家长' : '孩子'}
                      </View>
                    </View>
                    <View className='member-actions'>
                      <Button
                        type='danger'
                        size='small'
                        onClick={() => handleRemoveUserFromGroup(member.id)}
                      >
                        移除
                      </Button>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View className='available-users-section'>
          <View className='section-title'>可添加的用户</View>
          {filteredUsers.length === 0 ? (
            <Empty text='暂无可添加的用户' />
          ) : (
            <>
              {selectedUsers.length > 0 && (
                <Button
                  type='primary'
                  size='small'
                  className='batch-action'
                  onClick={handleBatchAddUsers}
                >
                  批量添加
                </Button>
              )}
              <View className='user-list'>
                {filteredUsers.map(user => (
                  <View key={user.id} className='user-item'>
                    <View className='user-info'>
                      <View className='username'>{user.username}</View>
                      <View className='user-type'>
                        {user.userType === 'parent' ? '家长' : '孩子'}
                      </View>
                      {user.groups && user.groups.length > 0 && (
                        <View className='user-groups'>
                          已加入：{user.groups.join(', ')}
                        </View>
                      )}
                    </View>
                    <View className='user-actions'>
                      <Button
                        type='primary'
                        size='small'
                        onClick={() => handleAddUserToGroup(user.id)}
                      >
                        添加
                      </Button>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    )
  }

  return (
    <View className='group-management'>
      {showCreateForm && (
        <Dialog
          title='创建用户组'
          visible={showCreateForm}
          onClose={() => {
            setShowCreateForm(false)
            groupForm.resetFields()
          }}
          footer={
            <View className='dialog-footer'>
              <Button 
                type='default'
                onClick={() => {
                  setShowCreateForm(false)
                  groupForm.resetFields()
                }}
              >
                取消
              </Button>
              <Button 
                type='primary'
                onClick={() => groupForm.submit()}
              >
                确定
              </Button>
            </View>
          }
          closeOnOverlayClick={false}
        >
          <Form
            form={groupForm}
            onFinish={onCreateGroup}
          >
            <Form.Item
              label='组名'
              name='name'
              rules={[{ required: true, message: '请输入组名' }]}
            >
              <Input
                className='form-input'
                placeholder='请输入组名'
                type='text'
              />
            </Form.Item>
            <Form.Item
              label='描述'
              name='description'
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <TextArea
                className='form-textarea'
                placeholder='请输入描述'
                maxLength={200}
                rows={4}
              />
            </Form.Item>
          </Form>
        </Dialog>
      )}

      {showMemberManagement ? renderMemberManagement() : renderGroupList()}

      {/* 删除用户组确认对话框 */}
      <Dialog id='delete-group-dialog' />
      {/* 移除用户确认对话框 */}
      <Dialog id='remove-user-dialog' />
      {/* 批量添加用户确认对话框 */}
      <Dialog id='batch-add-dialog' />
      {/* 批量移除用户确认对话框 */}
      <Dialog id='batch-remove-dialog' />
    </View>
  )
}

export default GroupManagement
