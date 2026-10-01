import React, {ReactNode} from 'react'

interface WhenProps {
  isTrue: boolean | undefined
  children: ReactNode
}

const When: React.FC<WhenProps> = ({isTrue, children}) => {
  if (!isTrue) {
    return null
  }

  return <>{children}</>
}

export default When
