import {Spin} from 'antd'

interface LoadingFallbackProps {
  message?: string
}

export default function LoadingFallback({message = 'Loading...'}: LoadingFallbackProps) {
  return (
    <div className='flex flex-1 justify-center items-center min-h-screen'>
      <div className='flex flex-col items-center gap-4'>
        <Spin size='large' />
        <div className='text-gray-600'>{message}</div>
      </div>
    </div>
  )
}
