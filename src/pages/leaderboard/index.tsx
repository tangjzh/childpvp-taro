import { View, Text } from '@tarojs/components'
import { Avatar, Loading } from '@nutui/nutui-react-taro'
import { useState, useEffect } from 'react'
import { useDidShow } from '@tarojs/taro'
import { useAuthStore } from '@/store'
import Layout from '@/components/Layout'
import request from '@/utils/request'
import './index.scss'

interface RankingUser {
  id: number
  username: string
  points: number
  rank: number
}

const LeaderboardPage = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)
  const userInfo = useAuthStore((state) => state.userInfo)

  useEffect(() => {
    fetchRankings()
  }, [])

  useDidShow(() => {
    fetchRankings()
  })

  const fetchRankings = async () => {
    try {
      const response = await request.get('/leaderboard')
      setRankings(response.data)
    } catch (error) {
      console.error('获取排行榜失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return rank
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { color: '#FFD700', fontWeight: 'bold' } // 金
      case 2:
        return { color: '#C0C0C0', fontWeight: 'bold' } // 银
      case 3:
        return { color: '#CD7F32', fontWeight: 'bold' } // 铜
      default:
        return {}
    }
  }

  // 获取当前用户的排名
  const getMyRanking = () => {
    return rankings.find(user => user.id === userInfo?.id)
  }

  return (
    <Layout title='排行榜'>
      <View className='leaderboard-page'>
        {/* 我的排名 */}
        <View className='my-ranking'>
          <View className='title'>我的排名</View>
          <View className='ranking-card'>
            <View className='rank-number' style={getRankStyle(getMyRanking()?.rank || 0)}>
              {getMyRanking() ? getRankEmoji(getMyRanking()!.rank) : '-'}
            </View>
            <View className='user-info'>
              <Avatar 
                size='large' 
                src={userInfo?.avatar}
                className='avatar'
              >
                {userInfo?.username?.[0]?.toUpperCase() || '孩'}
              </Avatar>
              <View className='details'>
                <Text className='username'>{userInfo?.username}</Text>
                <Text className='points'>{userInfo?.points || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 排行榜列表 */}
        <View className='rankings'>
          <View className='title'>排行榜</View>
          {loading ? (
            <View className='loading'>
              <Loading type='spinner' />
              <Text className='loading-text'>加载中...</Text>
            </View>
          ) : (
            rankings.map((user) => (
              <View
                key={user.id}
                className='ranking-item'
              >
                <View className='rank-number' style={getRankStyle(user.rank)}>
                  {getRankEmoji(user.rank)}
                </View>
                <View className='user-info'>
                  <Avatar 
                    size='large' 
                    className='avatar'
                  >
                    {user.username[0]?.toUpperCase() || '孩'}
                  </Avatar>
                  <View className='details'>
                    <Text className='username'>{user.username}</Text>
                    <Text className='points'>{user.points}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </Layout>
  )
}

export default LeaderboardPage 