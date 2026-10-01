import useFilter from '@hooks/useFilter'
import timelineFilterTypes from '../../../../../../@staticData/timelineFilter'
import timelineFilterForBracesOnly from '../../../../../../@staticData/timelineFilterForBracesOnly'
import FilterTimeline from './FilterTimeline'
import {Collapse, ConfigProvider} from 'antd'
import {useState} from 'react'
import DropdownSvg from 'assets/icons/DropdownSvg'
import When from 'components/when/When'

import {fileFormatDateTimeForTimeline} from 'utils/DateFunctions'
import SwitchArrowsWithoutCircleIcon from 'assets/icons/SwitchArrowsWithoutCircleIcon'
import {useNavigate, useParams} from 'react-router-dom'
import {IEventType} from '../Timeline'
import getActiveFilter from 'screens/Patients/PatientList/utils/getActiveFilter'
import {getFirstLetterCapitalOfWord, validateList} from 'utils/ConstFunctions'
import moment from 'moment'
import clsx from 'clsx'
import timelineFilterOptionConstant from '../../../../../../@constants/timelineFilterOption.constant'
import {TimelineEventsType} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import hasValue from 'utils/hasValue'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import {setActiveKey} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'

export interface TimelineData {
  [day: string]: any[]
}
export interface props {
  allTimelineData: IEventType
  isBracesOnly: boolean
}

export const TimelinePart = (props: props) => {
  const {allTimelineData, isBracesOnly} = props
  let timelineFilters = timelineFilterTypes
  if (isBracesOnly) {
    timelineFilters = timelineFilterForBracesOnly
  }
  type TimelineFilterOption = (typeof timelineFilters)[number]
  const {filter, handleFilterChange} = useFilter<TimelineFilterOption>(timelineFilters)
  const filteredData =
    getActiveFilter<TimelineFilterOption>({filter}) === timelineFilterOptionConstant.ALL_UPDATES
      ? allTimelineData.filteredAllEvents
      : allTimelineData.filteredAlignerChangeEvents

  const displayedDateTags: {[key: string]: boolean} = {}

  return (
    <div className='w-full h-full border border-mediumGray rounded-lg p-6'>
      <div className='w-full md:w-1/2'>
        <FilterTimeline
          {...{
            filterOptions: timelineFilters,
            filter,
            handleFilterChange,
          }}
        />
      </div>
      <When isTrue={filteredData.length === 0}>
        <div className='text-lg text-center mt-10 text-textColor'>No aligner change updates</div>
      </When>
      <div className='mt-4'>
        {validateList(filteredData) &&
          filteredData.map((event: any, index: number) => {
            const formattedDate = moment(event.event_time).format('MMMM YYYY')

            const displayDateTag = !displayedDateTags[formattedDate]
            displayedDateTags[formattedDate] = true

            return (
              <div key={index}>
                <When isTrue={displayDateTag}>
                  <div className='text-[18px] font-semibold my-4'>{formattedDate}</div>
                </When>
                <div
                  key={event.event_id}
                  className={clsx(
                    'ml-2 border-l-[1px] border-dashed border-textColor pl-2',
                    event.event_id === filteredData[filteredData.length - 1].event_id &&
                      '!border-white'
                  )}
                >
                  <TimelineBox timeline={event} />
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

const TimelineBox = (timeline: any) => {
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const [activeKeys, setActiveKeys] = useState([])
  const handleCollapseChange = (key: any) => {
    setActiveKeys(key)
  }
  const timelines = timeline.timeline

  return (
    <div>
      <When isTrue={timelines?.type === TimelineEventsType.PRODUCT_TYPE_ADDED}>
        <div className='flex-start flex items-center pb-10'>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading
            title={` ${
              timelines?.metadata?.product_type_name === treatmentTypeMain.ALIGNERS
                ? 'Clear aligners'
                : 'Braces'
            } treatment added`}
            time={timelines?.event_time}
          />
        </div>
      </When>

      <When isTrue={timelines?.type === TimelineEventsType.TREATMENT_DEACTIVATED}>
        <div className='flex-start flex items-center pb-10'>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading title={'Treatment deactivated'} time={timelines?.event_time} />
        </div>
      </When>

      <When isTrue={timelines?.type === TimelineEventsType.TREATMENT_PAUSED}>
        <div className='flex-start flex items-center pb-10'>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading title={'Treatment paused'} time={timelines?.event_time} />
        </div>
      </When>

      <When isTrue={timelines?.type === TimelineEventsType.TREATMENT_RESUMED}>
        <div className='flex-start flex items-center pb-10'>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading title={'Treatment resumed'} time={timelines?.event_time} />
        </div>
      </When>

      <When isTrue={timelines?.type === TimelineEventsType.PATIENT_ADDED}>
        <div className='flex-start flex items-center pb-10'>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading title={'Patient Added'} time={timelines?.event_time} />
        </div>
      </When>

      <When isTrue={timelines?.type === TimelineEventsType.TREATMENT_STARTING}>
        <div className='flex-start flex items-center pb-10'>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading
            title={`Clear aligners ${timelines?.metadata?.aligner_journey_details?.treatment_plan_name} started`}
            time={timelines?.event_time}
          />
        </div>
      </When>

      <When isTrue={timelines?.type === TimelineEventsType.TREATMENT_PLAN_ADDED}>
        <div className='flex-start flex items-center '>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading title={' Treatment plan set-up'} time={timelines?.event_time} />
        </div>
        <div className='ml-5 pb-10 mt-2'>
          <div
            className='flex justify-between items-center shadow-second px-4 py-3 rounded-lg cursor-pointer'
            onClick={() => {
              const treatmentPlan = timelines?.metadata?.aligner_treatment_response

              dispatchAction(
                getTreatmentPlan({
                  aligner_treatment_id: String(treatmentPlan.treatment_plan_id),
                })
              )
              if (
                treatmentPlan.status === treatmentPlanStatusConstants.DRAFT &&
                !hasValue(treatmentPlan.approved_by_patient_at)
              ) {
                navigate(`/profile/${patientId}/view-plan/${treatmentPlan.treatment_plan_id}`)
              } else if (
                treatmentPlan.status === treatmentPlanStatusConstants.DRAFT &&
                hasValue(treatmentPlan.approved_by_patient_at)
              ) {
                navigate(`/profile/${patientId}/view-plan/${treatmentPlan.treatment_plan_id}`)
              } else if (treatmentPlan.status === treatmentPlanStatusConstants.ACTIVE) {
                navigate(`/profile/${patientId}/view-plan/${treatmentPlan.treatment_plan_id}`)
              } else {
                navigate(`/profile/${patientId}/view-plan/${treatmentPlan.treatment_plan_id}`)
              }
            }}
          >
            <div className=' flex items-center gap-3 bg-transparent'>
              <div className='w-4 h-8 bg-tertiaryColor rounded-[4px]'></div>
              <div className='flex items-center gap-2 text-[16px] font-medium '>
                {timelines?.metadata?.aligner_treatment_response?.treatment_plan_name} details
              </div>
            </div>
            <DropdownSvg color='black' height='18' width='18' />
          </div>
        </div>
      </When>

      <When
        isTrue={
          timelines?.type === TimelineEventsType.FORCE_ALIGNER_CHANGE ||
          timelines?.type === TimelineEventsType.ALIGNER_CHANGE
        }
      >
        <div className='flex-start flex items-center '>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading
            title={`You advanced patient from ${
              getFirstLetterCapitalOfWord(timelines?.metadata?.previous_aligner_jaw_type) +
              ' ' +
              timelines?.metadata?.previous_aligner_no
            }
                 to 
                ${
                  getFirstLetterCapitalOfWord(timelines?.metadata?.new_aligner_jaw_type) +
                  ' ' +
                  timelines?.metadata?.new_aligner_no
                }`}
            time={timelines?.event_time}
          />
        </div>
        <div className='ml-5 pb-10'>
          <div
            className='flex justify-between items-center shadow-second  px-4 py-3 rounded-lg cursor-pointer'
            onClick={() => {
              dispatchAction(setActiveKey(timelines?.metadata?.previous_aligner_no))
              const queryParams = new URLSearchParams({
                patient_timeline_filter:
                  patientOverviewAlignerActionFilterConstantsConstants.ALL_ALIGNERS,
              }).toString()
              navigate(`/profile/${patientId}?${queryParams}`)
            }}
          >
            <div className=' flex items-center gap-3 bg-transparent'>
              <div className='w-4 h-8 bg-tertiaryColor rounded-[4px]'></div>
              <div className='flex items-center gap-2 text-[16px] font-medium '>
                {getFirstLetterCapitalOfWord(timelines?.metadata?.previous_aligner_jaw_type) +
                  ' ' +
                  timelines?.metadata?.previous_aligner_no}
                <SwitchArrowsWithoutCircleIcon />
                {getFirstLetterCapitalOfWord(timelines?.metadata?.new_aligner_jaw_type) +
                  ' ' +
                  timelines?.metadata?.new_aligner_no}
              </div>
            </div>
            <DropdownSvg color='black' height='18' width='18' />
          </div>
        </div>
      </When>

      <When isTrue={timelines?.type === TimelineEventsType.TIMELINE_NOTE_ADDED}>
        <div className='flex-start flex items-center'>
          <div className='relative right-[18px] bottom-2 w-5 h-5 bg-primaryColor rounded-full border-2 border-white'></div>
          <Heading title={' You added a note'} time={timelines?.event_time} />
        </div>
        <div className='ml-5 pb-10'>
          <ConfigProvider
            theme={{
              components: {
                Collapse: {
                  contentBg: '#ffffff',
                  headerBg: '#ffffff',
                },
              },
              token: {
                fontSizeIcon: 16,
                fontFamily: 'figtree',
              },
            }}
          >
            <Collapse
              className='custom-collapse'
              bordered={false}
              activeKey={activeKeys}
              onChange={handleCollapseChange}
              expandIconPosition='end'
              expandIcon={expandIcon}
              style={{
                boxShadow: '0px 3px 30px 0px rgba(0, 0, 0, 0.06)',
              }}
              items={[
                {
                  key: '1',
                  label: (
                    <div className='flex items-center gap-3 bg-transparent'>
                      <div className='w-4 h-8 bg-tertiaryColor rounded-[4px]'></div>
                      <div className='text-[16px] font-medium '>{timelines?.metadata?.title}</div>
                    </div>
                  ),
                  children: (
                    <div className='text-sm text-textColor font-medium'>
                      {timelines?.metadata?.note}
                    </div>
                  ),
                },
              ]}
            />
          </ConfigProvider>
        </div>
      </When>
    </div>
  )
}

export const expandIcon = ({isActive}: any) => (
  <div
    className={`flex-[0.1] flex items-center justify-center mt-2 transition-transform ${
      isActive ? 'rotate-90' : ''
    }`}
  >
    <DropdownSvg color='black' height='18' width='18' />
  </div>
)

const Heading = ({title, time}: {title: string; time: string}) => {
  return (
    <div className='w-full flex md:flex-row flex-col justify-between items-center '>
      <div className='w-full relative bottom-2 text-black text-base font-medium text-start'>
        {title}
      </div>
      <div className='w-full relative bottom-2 text-textColor text-xs font-semibold me-2 text-end'>
        {fileFormatDateTimeForTimeline(time)}
      </div>
    </div>
  )
}
