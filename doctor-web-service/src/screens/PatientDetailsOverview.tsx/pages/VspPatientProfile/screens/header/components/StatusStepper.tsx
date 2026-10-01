import {CheckCircle2, Clock, Eye, FileText, Send} from 'lucide-react'
import {Fragment} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import cn from '@utils/cn'

const STEPS = [
  {key: 'DRAFT', label: 'DRAFT', icon: <FileText size={20} />},
  {key: 'SUBMITTED', label: 'SUBMITTED', icon: <Send size={20} />},
  {key: 'IN_PROGRESS', label: 'IN Progress', icon: <Clock size={20} />},
  {key: 'IN_REVIEW', label: 'REVIEW', icon: <Eye size={20} />},
  {key: 'COMPLETED', label: 'COMPLETED', icon: <CheckCircle2 size={20} />},
]

const STATUS_ORDER: Record<string, number> = {
  DRAFT: 0,
  ORDERED: 2,
  NEED_MORE_INFO: 2,
  IN_PROGRESS: 2,
  RE_PLAN: 2,
  REQUEST_REVISION: 2,
  IN_REVIEW: 3,
  APPROVED: 4,
  COMPLETED: 4,
}

const StatusStepper = () => {
  const {vsp_stepper} = useSelector((state: RootState) => state.customerPatientProfile)
  const currentStatus = vsp_stepper?.order_status ?? ''
  const activeIndex = STATUS_ORDER[currentStatus] ?? 0
  return (
    <div className='rounded-2xl border border-lightGray bg-white px-3 py-4 shadow-sm md:px-5'>
      <div className='flex items-start overflow-x-auto scrollbar-hide'>
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex
          const isDone = index < activeIndex
          const isLast = index === STEPS.length - 1

          return (
            <Fragment key={step.key}>
              <div className='flex shrink-0 flex-col items-center gap-1 md:gap-2'>
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border transition-colors md:h-14 md:w-14',
                    isActive
                      ? 'border-primaryColor bg-primaryColor text-white shadow-colorPrimary'
                      : isDone
                        ? 'border-green-200 bg-green-100 text-green-600'
                        : 'border-lightGray bg-lightGray text-gray-400'
                  )}
                >
                  {isDone ? <CheckCircle2 size={22} /> : step.icon}
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap text-center text-[11px] font-bold uppercase tracking-[0.14em] md:text-[13px]',
                    isActive ? 'text-primaryColor' : isDone ? 'text-green-600' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'mx-2 mt-[22px] h-0.5 min-w-[48px] flex-1 md:mx-5 md:mt-[28px]',
                    isDone && index + 1 < activeIndex
                      ? 'bg-green-500'
                      : isDone
                        ? 'bg-primaryColor'
                        : 'bg-gray-200'
                  )}
                />
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default StatusStepper
