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
  NEED_MORE_INFO: 2,
  IN_PROGRESS: 2,
  RE_PLAN: 2,
  IN_REVIEW: 3,
  APPROVED: 4,
  COMPLETED: 4,
}

const StatusStepper = () => {
  const {planning_stepper} = useSelector((state: RootState) => state.customerPatientProfile)
  const currentStatus = planning_stepper?.order_status ?? 'DRAFT'
  const activeIndex = STATUS_ORDER[currentStatus] ?? 0

  return (
    <div className='flex items-start bg-white px-2  overflow-x-auto scrollbar-hide md:h-20 h-18'>
      {STEPS.map((step, index) => {
        const isActive = index === activeIndex
        const isDone = index < activeIndex
        const isLast = index === STEPS.length - 1

        return (
          <Fragment key={step.key}>
            <div className='flex flex-col items-center gap-1 md:gap-2 shrink-0'>
              <div
                className={cn(
                  'flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full transition-colors',
                  isActive
                    ? 'bg-primaryColor text-white shadow-colorPrimary'
                    : isDone
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                )}
              >
                {isDone ? <CheckCircle2 size={20} /> : step.icon}
              </div>
              <span
                className={cn(
                  'text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-center whitespace-nowrap',
                  isActive ? 'text-primaryColor' : isDone ? 'text-green-600' : 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'flex-1 min-w-[20px] h-0.5 mt-[18px] md:mt-[21px] mx-0.5 md:mx-1',
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
  )
}

export default StatusStepper
