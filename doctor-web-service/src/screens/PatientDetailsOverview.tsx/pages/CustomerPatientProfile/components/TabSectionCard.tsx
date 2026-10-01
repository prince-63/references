import {Plus} from 'lucide-react'
import {ReactNode} from 'react'
import {useSelector} from 'react-redux'
import {useSearchParams} from 'react-router-dom'
import {RootState} from 'redux/store'

const TabSectionCard = ({
  title,
  onClick,
  buttonText,
  children,
  buttonLoading = false,
  extraActionButtons,
}: {
  title: string
  onClick?: () => void
  buttonText?: string | null
  children: ReactNode
  buttonLoading?: boolean
  extraActionButtons?: ReactNode
}) => {
  const [searchParams] = useSearchParams()
  const {active_order_id} = useSelector((state: RootState) => state.customerPatientProfile)
  const isActiveOrderSelected = searchParams.get('order_id') === active_order_id

  return (
    <div className='w-full mx-auto flex flex-col min-h-0 h-full'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2'>
        <h2 className='text-base md:text-lg text-slate-400 uppercase font-extrabold tracking-[0.14em]'>
          {title}
        </h2>
        <div className='flex items-center gap-2'>
          {extraActionButtons}
          {buttonText && isActiveOrderSelected && (
            <button
              onClick={onClick && onClick}
              className='flex items-center gap-1 bg-primaryColor text-white border-primaryColor px-2 py-1.5 rounded-lg border text-sm font-semibold transition-colors uppercase tracking-wide'
              disabled={buttonLoading}
            >
              <Plus size={20} />
              <span>{buttonText}</span>
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default TabSectionCard
