import {Archive} from 'lucide-react'

const ProductSetupHeader = () => {
  return (
    <div className='sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur'>
      <div className='mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:py-4'>
        <div className='min-w-0'>
          <h1 className='text-xl font-semibold tracking-tight sm:text-2xl'>Production Setup</h1>
          <p className='mt-0.5 text-xs text-neutral-500 sm:mt-1 sm:text-sm'>
            Confirm how you want to manufacture this case.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            aria-label='Archive case'
            className='rounded-full border border-neutral-300 p-2 text-neutral-700 hover:bg-neutral-100 sm:hidden'
          >
            <Archive className='h-4 w-4' />
          </button>
          <button className='hidden rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 sm:block'>
            Archive Case
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductSetupHeader
