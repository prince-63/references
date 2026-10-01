import React from 'react'

interface ChatMessageProps {
  message: string
}

const ChatMessage: React.FC<ChatMessageProps> = ({message}) => {
  const lines = message.split('\n')

  return (
    <div className='bg-primaryColor px-3 py-2 rounded-tl-lg rounded-bl-lg rounded-br-lg  break-words max-w-[30rem]'>
      {lines.map((line, index) => (
        <p key={index} className='text-sm text-white'>
          {line}
        </p>
      ))}
    </div>
  )
}

export default ChatMessage
