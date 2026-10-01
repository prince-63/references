import InfoIcon from 'assets/icons/InfoIcon'
import React from 'react'

const InfoMessage = ({tipMessage}: {tipMessage: React.ReactNode}) => {
  return (
    <div className='flex gap-1 text-textColor text-xs font-semibold items-center'>
      <InfoIcon width='16' height='16' />
      <p>{tipMessage}</p>
    </div>
  )
}

export default InfoMessage
