/* eslint-disable @typescript-eslint/no-unused-vars */
import useBlockNavigation from '@hooks/useBlockNavigation'
import React, {createContext, useContext, useState} from 'react'
import {Path} from 'react-router-dom'

export const CustomNavigateContext = createContext({
  navigate: (to: string | Partial<Path>) => {},
  setShouldBlock: (value: boolean) => {},
  handleModalClose: (confirmNavigation: boolean) => {},
  isModalVisible: false,
  shouldBlock: false,
})

export const CustomNavigateProvider = ({children}: {children: React.ReactNode}) => {
  const [shouldBlock, setShouldBlock] = useState(false)
  const {handleNavigationAttempt, handleModalClose, isModalVisible} = useBlockNavigation(
    shouldBlock,
    setShouldBlock
  )

  const navigate = (to: string | Partial<Path>) => {
    handleNavigationAttempt(to)
  }

  return (
    <CustomNavigateContext.Provider
      value={{navigate, setShouldBlock, handleModalClose, isModalVisible, shouldBlock}}
    >
      {children}
    </CustomNavigateContext.Provider>
  )
}

export const useNavigate = () => {
  const context = useContext(CustomNavigateContext)
  if (context === undefined) {
    throw new Error('useNavigate must be used within a CustomNavigateProvider')
  }
  return context
}
