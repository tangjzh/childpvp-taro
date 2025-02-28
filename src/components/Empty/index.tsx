import { View, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import './index.scss'

interface EmptyProps {
  text?: string
  buttonText?: string
  onClick?: () => void
}

const Empty: React.FC<EmptyProps> = ({
  text = '暂无数据',
  buttonText,
  onClick
}) => {
  return (
    <View className='empty'>
      <View className='empty-icon'>
        <View className='box'>
          <View className='box-inner' />
        </View>
      </View>
      <Text className='empty-text'>{text}</Text>
      {buttonText && onClick && (
        <Button
          type='primary'
          size='small'
          className='empty-button'
          onClick={onClick}
        >
          {buttonText}
        </Button>
      )}
    </View>
  )
}

export default Empty 