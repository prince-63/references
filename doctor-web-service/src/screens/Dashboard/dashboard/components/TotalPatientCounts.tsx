import React from 'react'
import useAllUserPlan from '@hooks/useAllUserPlan'
import clsx from 'clsx'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {
  ITreatmentCounts,
  PatientCount,
} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import {SVG_PATIENT_TWO_GRAY} from 'utils/SvgConstants'

interface ICountProps {
  title: string
  count: number
  showBorder?: boolean
}

const TotalPatientCounts = (countsData: ITreatmentCounts) => {
  return (
    <div className='!w-full flex md:flex-col flex-row gap-3 overflow-x-auto h-full '>
      <div className='!w-ful flex flex-col border border-mediumGray sm:h-[110px] md:h-full rounded-lg '>
        <div className='flex flex-col justify-between gap-3 w-full h-full md:p-4 p-2'>
          <div>
            <div className='text-sm font-medium text-textColor'>Total patients</div>
            <div className='text-2xl font-semibold'>{countsData?.patient_count?.total}</div>
          </div>
          <div className='flex gap-3 md:w-fit w-full'>
            <CountsCard title={'Leads'} count={countsData?.patient_count?.lead} />
            <CountsCard
              title={'Active'}
              count={countsData?.patient_count?.active}
              showBorder={false}
            />
          </div>
        </div>
      </div>
      <div className='md:!w-full !w-[450px] flex flex-col box-border border border-mediumGray sm:h-[110px] md:h-full rounded-lg'>
        <div className='flex flex-col justify-between gap-3 w-full h-full md:p-4 p-2'>
          <div>
            <div className='text-sm font-medium text-textColor'>Leads</div>
            <div className='text-2xl font-semibold'>{countsData?.lead_count?.total}</div>
          </div>
          <div className='flex gap-3 md:w-fit w-full'>
            <CountsCard title={'In Assessment'} count={countsData?.lead_count?.in_assessment} />
            <CountsCard title={'In Planning'} count={countsData?.lead_count?.in_planning} />
            <CountsCard
              title={'Tracking Pending'}
              count={countsData?.lead_count?.tracking_pending}
              showBorder={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default TotalPatientCounts

export const HeaderCounts: React.FC<{totalPatients: number}> = ({totalPatients}) => {
  return (
    <div>
      <div className='flex gap-2 justify-start items-center text-[20px] font-medium text-textColor'>
        <CommonSVG svg={SVG_PATIENT_TWO_GRAY} width='16' height='19' />
        Total patients
      </div>
      <div className='text-[32px] font-semibold'>{totalPatients}</div>
    </div>
  )
}

export const BodyCounts: React.FC<{allPatientCount: PatientCount}> = ({allPatientCount}) => {
  const {isStarterPlanUser} = useAllUserPlan()
  return (
    <div className='flex  flex-col gap-4'>
      <CountsCard title={'Leads'} count={allPatientCount?.lead} />
      <CountsCard title={'Clear aligners'} count={allPatientCount?.clear_aligner} />
      <When isTrue={isStarterPlanUser}>
        <CountsCard title={'Braces'} count={allPatientCount?.braces} />
      </When>
    </div>
  )
}

export const CountsCard = (props: ICountProps) => {
  const {title, count, showBorder = true} = props
  return (
    <div
      className={clsx(
        'flex gap-2 text-sm font-medium pr-3 w-full',
        showBorder && 'border-r border-grayDisabled'
      )}
    >
      <div className=''>{count}</div>
      <div className='text-textColor w-full flex-shrink-0 !whitespace-nowrap'>{title}</div>
    </div>
  )
}
