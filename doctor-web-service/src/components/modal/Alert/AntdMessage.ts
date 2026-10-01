import {message} from 'antd'

export default ({
  type = 'success',
  text,
  onClose,
  maxCount = 1,
}: {
  type?: 'success' | 'error' | 'info' | 'warning' | 'loading' | undefined
  text: string
  onClose?: () => void
  maxCount?: number
}) => {
  message.config({
    maxCount: maxCount,
  })
  message.open({
    type: type,
    content: text,
    duration: 4,
    onClose: onClose,
  })
}
