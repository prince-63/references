import React, {createContext, useContext, ReactNode} from 'react'
import {CustomEventContentArg} from '../calendar.types'

interface EventContextProps {
  event: CustomEventContentArg['event']
}

interface EventProviderProps {
  event: CustomEventContentArg['event']
  children: ReactNode
}

const EventContext = createContext<EventContextProps | undefined>(undefined)

export const useEvent = () => {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider')
  }
  return context
}

export const EventProvider: React.FC<EventProviderProps> = ({event, children}) => {
  return <EventContext.Provider value={{event}}>{children}</EventContext.Provider>
}
