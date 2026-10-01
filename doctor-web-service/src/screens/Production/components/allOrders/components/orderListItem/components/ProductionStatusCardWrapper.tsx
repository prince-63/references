import {ReactNode} from 'react'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'

const ProductionStatusCardWrapper = ({
  headerIcon,
  headerText,
  children,
}: {
  headerIcon?: ReactNode
  headerText: string
  children: ReactNode
}) => {
  return (
    <div className='flex-grow flex-shrink min-h-44 rounded-lg border border-mediumGray p-3.5 flex flex-col gap-3 min-w-[200px] max-w-[700px] break-all card-wrapper max-h-[150px]  overflow-auto'>
      <div className='flex items-center gap-2.5'>
        <When isTrue={hasValue(headerIcon)}>
          <div className='bg-lightGray flex items-center justify-center rounded h-8 w-8 p-0.5'>
            {headerIcon}
          </div>
        </When>
        <p className='font-medium text-xs md:text-base'>{headerText}</p>
      </div>
      {children}
    </div>
  )
}

export default ProductionStatusCardWrapper
