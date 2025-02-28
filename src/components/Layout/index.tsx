import { View } from '@tarojs/components'
import { ReactNode } from 'react'
import { useAuthStore } from '@/store'
import './index.scss'

interface LayoutProps {
  children: ReactNode
  showTabBar?: boolean
  title?: string
}

const Layout: React.FC<LayoutProps> = ({ children, showTabBar = true, title }) => {
  const userInfo = useAuthStore((state) => state.userInfo)

  return (
    <View className='layout'>
      {title && (
        <View className='layout-header'>
          <View className='layout-title'>{title}</View>
          {/* {userInfo && (
            <View className='layout-user-info'>
              <View className='points'>积分: {userInfo.points}</View>
            </View>
          )} */}
        </View>
      )}
      <View className='layout-content'>{children}</View>
    </View>
  )
}

export default Layout 