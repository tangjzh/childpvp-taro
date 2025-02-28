import { View, Text } from '@tarojs/components'
import { Tag, Button, Dialog } from '@nutui/nutui-react-taro'
import { useState, useEffect } from 'react'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useAuthStore, useRewardStore } from '@/store'
import Layout from '@/components/Layout'
import Empty from '@/components/Empty'
import request from '@/utils/request'
import './index.scss'

interface Reward {
  id: number
  title: string
  points: number
  redeemed: boolean
  reusable: boolean
  childName?: string
  parentName?: string
}

const RewardPage = () => {
  const [loading, setLoading] = useState(false)
  const userInfo = useAuthStore((state) => state.userInfo)
  const { rewards, setRewards } = useRewardStore()

  useEffect(() => {
    fetchRewards()
  }, [])

  useDidShow(() => {
    fetchRewards()
  })

  const fetchRewards = async () => {
    try {
      const response = await request.get('/rewards')
      setRewards(response.data)
    } catch (error) {
      console.error('获取奖励列表失败:', error)
      Taro.showToast({
        title: '获取奖励列表失败',
        icon: 'error'
      })
    }
  }

  const handleRedeemReward = async (rewardId: number, requiredPoints: number) => {
    if (loading) return

    if (!userInfo?.points || userInfo.points < requiredPoints) {
      Taro.showToast({
        title: '积分不足',
        icon: 'error'
      })
      return
    }

    try {
      setLoading(true)
      await request.post(`/rewards/${rewardId}/redeem`)
      
      // 更新本地状态
      const updatedRewards = rewards.map(reward => 
        reward.id === rewardId ? { ...reward, redeemed: true } : reward
      )
      setRewards(updatedRewards)

      // 更新用户积分
      useAuthStore.setState({
        userInfo: {
          ...userInfo,
          points: userInfo.points - requiredPoints
        }
      })

      Taro.showToast({
        title: '兑换成功',
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '兑换失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReward = async (rewardId: number) => {
    Dialog.open('delete-reward-dialog', {
      title: '删除奖励',
      content: '确定要删除这个奖励吗？删除后将无法恢复',
      onConfirm: async () => {
        try {
          await request.delete(`/rewards/${rewardId}`)
          setRewards(rewards.filter(reward => reward.id !== rewardId))
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
        Dialog.close('delete-reward-dialog')
      },
      onCancel: () => {
        Dialog.close('delete-reward-dialog')
      }
    })
  }

  const confirmRedeem = (reward: Reward) => {
    Dialog.open('redeem-dialog', {
      title: '确认兑换',
      content: `确定要兑换「${reward.title}」吗？将消耗 ${reward.points} 积分`,
      onConfirm: () => {
        Dialog.close('redeem-dialog')
        handleRedeemReward(reward.id, reward.points)
      }
    })
  }

  return (
    <Layout title='奖励商店'>
      <View className='reward-page'>
        {/* 积分展示 */}
        {userInfo?.userType === 'child' && (
          <View className='user-points'>
            <View className='points-text'>
              当前积分 <Text className='points'>{userInfo.points || 0}</Text>
            </View>
          </View>
        )}

        {/* 奖励列表 */}
        <View className='reward-list'>
          {rewards.length === 0 ? (
            <Empty 
              text='暂无可兑换的奖励'
              buttonText={userInfo?.userType === 'parent' ? '添加奖励' : undefined}
              onClick={() => Taro.navigateTo({ url: '/pages/reward/create/index' })}
            />
          ) : (
            rewards.map(reward => (
              <View
                key={reward.id}
                className={`reward-card ${reward.redeemed ? 'redeemed' : ''}`}
              >
                <View className='reward-header'>
                  <View className='reward-title'>{reward.title}</View>
                  <View className='points-tag'>{reward.points}</View>
                </View>

                <View className='reward-info'>
                  {userInfo?.userType === 'parent' ? (
                    <View className='info-item'>
                      <Text className='label'>分配给：</Text>
                      <Text className='value'>{reward.childName}</Text>
                    </View>
                  ) : (
                    <View className='info-item'>
                      <Text className='label'>来自：</Text>
                      <Text className='value'>{reward.parentName}</Text>
                    </View>
                  )}
                  {reward.reusable && (
                    <Tag type='success' className='reusable-tag'>可重复兑换</Tag>
                  )}
                </View>

                <View className='reward-footer'>
                  {userInfo?.userType === 'parent' ? (
                    <Button
                      type='danger'
                      size='small'
                      loading={loading}
                      onClick={() => handleDeleteReward(reward.id)}
                    >
                      删除
                    </Button>
                  ) : (
                    !reward.redeemed && (
                      <Button
                        type='primary'
                        size='small'
                        loading={loading}
                        disabled={(userInfo?.points ?? 0) < reward.points}
                        onClick={() => confirmRedeem(reward)}
                      >
                        立即兑换
                      </Button>
                    )
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* 新增奖励按钮 */}
        {userInfo?.userType === 'parent' && (
          <View style={{ padding: '0 20px', marginTop: '40px' }}>
            <Button
              block
              type='primary'
              onClick={() => Taro.navigateTo({ url: '/pages/reward/create/index' })}
            >
              新增奖励
            </Button>
          </View>
        )}

        {/* 兑换确认弹窗 */}
        <Dialog id='redeem-dialog' />
        
        {/* 删除确认弹窗 */}
        <Dialog id='delete-reward-dialog' />
      </View>
    </Layout>
  )
}

export default RewardPage 