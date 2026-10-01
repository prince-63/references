import React from 'react'

interface ConditionalDetailProps {
  children?: React.ReactNode
}

const ConditionalDetail: React.FC<ConditionalDetailProps> = ({children}) => {
  if (!children) return null

  return <div>{children}</div>
}

export default ConditionalDetail
