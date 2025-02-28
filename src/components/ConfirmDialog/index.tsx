import { Dialog } from '@nutui/nutui-react-taro'
import { ReactNode } from 'react'

interface ConfirmDialogProps {
  id: string
  title: string
  content: ReactNode
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  id,
  title,
  content,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消'
}) => {
  return (
    <Dialog
      id={id}
      title={title}
      content={content}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText={confirmText}
      cancelText={cancelText}
    />
  )
}

export default ConfirmDialog 