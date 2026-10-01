import React from 'react'

interface StatusAndProductionLabUpdateModalBodyProps {
  statusChangeMessage: string
  newStatus: string
  productionLabChangeMessage: string
  newProductionLab: string
}

const StatusAndProductionLabUpdateModalBody = ({
  statusChangeMessage,
  newStatus,
  productionLabChangeMessage,
  newProductionLab,
}: StatusAndProductionLabUpdateModalBodyProps) => {
  return (
    <div className='flex  gap-8 border border-gray-300 mt-4 rounded-lg bg-white'>
      <div className='flex-1 flex flex-col items-center justify-center gap-2 px-4 py-2 border-r border-gray-300'>
        <div className='text-textColor text-s'>{statusChangeMessage}</div>
        <div className='text-l font-semibold  text-center'>{newStatus}</div>
      </div>

      <div className='flex-1 flex flex-col items-center justify-center gap-2 px-4 py-2'>
        <div className='text-textColor text-s'>{productionLabChangeMessage}</div>
        <div className='text-l font-semibold text-center'>{newProductionLab}</div>
      </div>
    </div>
  )
}

export default StatusAndProductionLabUpdateModalBody
