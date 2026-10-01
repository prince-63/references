import {Lock} from 'lucide-react'

const ProductionLocked = () => {
  return (
    <div className='flex w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-20'>
      <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lighterGray'>
        <Lock className='h-6 w-6 text-gray-400' />
      </div>
      <h2 className='mb-2 text-base font-bold text-textColor'>Production Locked</h2>
      <p className='max-w-xs text-center text-sm text-gray-400'>
        Surgical splint production cannot begin until the 3D treatment plan has been finalized and
        approved by the doctor.
      </p>
    </div>
  )
}

export default ProductionLocked
