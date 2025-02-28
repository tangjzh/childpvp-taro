import { View } from '@tarojs/components'
import { Input, TextArea } from '@nutui/nutui-react-taro'
import { ReactNode } from 'react'
import './index.scss'

interface FormItemProps {
  label: string
  name: string
  required?: boolean
  error?: string
  type?: 'text' | 'number' | 'textarea'
  value?: string | number
  onChange?: (value: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
  className?: string
  children?: ReactNode
}

const FormItem: React.FC<FormItemProps> = ({
  label,
  name,
  required,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
  className = '',
  children
}) => {
  const handleChange = (val: string | number) => {
    onChange?.(String(val))
  }

  const renderInput = () => {
    if (children) return children

    const commonProps = {
      value: value as string,
      onChange: handleChange,
      placeholder,
      maxLength
    }

    switch (type) {
      case 'textarea':
        return (
          <TextArea
            {...commonProps}
            rows={rows}
            className='form-textarea'
          />
        )
      case 'number':
        return (
          <Input
            {...commonProps}
            type='number'
            className='form-input'
          />
        )
      default:
        return (
          <Input
            {...commonProps}
            type='text'
            className='form-input'
          />
        )
    }
  }

  return (
    <View className={`form-item ${className} ${error ? 'has-error' : ''}`}>
      <View className='form-label'>
        {required && <View className='required'>*</View>}
        {label}
      </View>
      <View className='form-content'>
        {renderInput()}
        {error && <View className='error-message'>{error}</View>}
      </View>
    </View>
  )
}

export default FormItem 