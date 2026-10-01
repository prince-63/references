import clsx from 'clsx'
import leadsOverviewConstants from '@constants/leadsOverview.constants'
import {leadsOverviewOptions} from '@staticData/leadsOverviewOptions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {setSelectedOverviewStep} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import When from 'components/when/When'
import IconLock from 'assets/icons/IconLock'
import IconRadioGreenCheck from 'assets/icons/IconRadioGreenCheck'
import InfoIcon from 'assets/icons/InfoIcon'
import orderStatusConstants from '@constants/orderStatus.constants'
import hasValue from 'utils/hasValue'
import useAllUserPlan from '@hooks/useAllUserPlan'

const ListItem = ({
  isChecked,
  value,
  isSelected,
}: {
  isChecked: boolean
  value: (typeof leadsOverviewConstants)[keyof typeof leadsOverviewConstants]
  isSelected: boolean

  currentState: {
    ASSESSMENT: boolean
    SETUP_TREATMENT: boolean
    ADD_TRACKING: boolean
  }
}) => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const treatment_status = data.getting_started_details?.treatment_status
  const tracking_status = data.getting_started_details?.tracking_status
  const order_status = data.getting_started_details?.order_status
  const locked_order_status = order_status === null || order_status === orderStatusConstants.DRAFT
  const {dispatchAction} = useDispatchAction()
  const {isPractice} = useAllUserPlan()
  return (
    <div
      onClick={() => {
        dispatchAction(setSelectedOverviewStep(value))
      }}
      className={clsx(
        'flex items-center justify-start gap-4 min-w-fit w-full p-4 rounded-lg cursor-pointer md:border-none border border-mediumGray',

        isSelected &&
          ((value === leadsOverviewConstants.SETUP_TREATMENT &&
            treatment_status === 'DRAFT' &&
            !isPractice) ||
          (value === leadsOverviewConstants.ADD_TRACKING && tracking_status === 'DRAFT') ||
          (value === leadsOverviewConstants.ORDERS && order_status === 'DRAFT')
            ? 'bg-orangeSupport'
            : 'bg-secondarySupport')
      )}
    >
      <span
        className={clsx(
          'h-[24px] min-w-[24px] w-[24px] border rounded-full flex items-center justify-center ',
          isSelected ? 'border-primaryColor' : 'border-textColor',
          isChecked && '!border-none',
          isSelected &&
            ((value === leadsOverviewConstants.SETUP_TREATMENT &&
              treatment_status === 'DRAFT' &&
              !isPractice) ||
              (value === leadsOverviewConstants.ADD_TRACKING && tracking_status === 'DRAFT') ||
              (value === leadsOverviewConstants.ORDERS && order_status === 'DRAFT')) &&
            '!border-orange'
        )}
      >
        {isChecked && <IconRadioGreenCheck />}
      </span>
      <div className='w-full flex flex-wrap justify-between items-center gap-2'>
        <span
          className={clsx(
            'text-textColor font-[400] text-[16px]',
            isSelected && '!text-black font-[600]'
          )}
        >
          {leadsOverviewOptions[value].trigger}
        </span>
        <When
          isTrue={
            (value === leadsOverviewConstants.ADD_TRACKING && treatment_status === null) ||
            (value == leadsOverviewConstants.SETUP_TREATMENT && locked_order_status && isPractice)
          }
        >
          <IconLock />
        </When>
        <When
          isTrue={
            (value === leadsOverviewConstants.SETUP_TREATMENT &&
              treatment_status === 'DRAFT' &&
              !isPractice) ||
            (value === leadsOverviewConstants.ADD_TRACKING && tracking_status === 'DRAFT') ||
            (value === leadsOverviewConstants.ORDERS && order_status === 'DRAFT')
          }
        >
          <InfoIcon color='#be8901' width='20' height='20' />
        </When>
      </div>
    </div>
  )
}

const OverviewList = () => {
  const {selectedOverviewStep} = useSelector((state: RootState) => state.leadsProfile)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const treatment_status = data.getting_started_details?.treatment_status
  const tracking_status = data.getting_started_details?.tracking_status
  const order_status = data.getting_started_details?.order_status
  const {isPractice} = useAllUserPlan()
  const isAssessmentCompleted =
    data.getting_started_details?.mark_all_as_read ||
    (data.getting_started_details?.pre_treatment_photos_filled &&
      data.getting_started_details?.scan_files_filled)

  const currentState = {
    [leadsOverviewConstants.ASSESSMENT]: isAssessmentCompleted,
    [leadsOverviewConstants.ORDERS]:
      hasValue(order_status) && order_status !== orderStatusConstants.DRAFT,
    [leadsOverviewConstants.SETUP_TREATMENT]:
      treatment_status === 'ACTIVE' || treatment_status === 'DEACTIVATED',
    [leadsOverviewConstants.ADD_TRACKING]: tracking_status === 'ACTIVE',
  }
  const leadsConstantsArray = Object.values(leadsOverviewConstants)
  return (
    <div className='flex md:flex-col gap-2 items-center justify-start md:justify-center w-full overflow-scroll'>
      {leadsConstantsArray.map((item) => {
        if (!isPractice && item === 'ORDERS') return
        return (
          <ListItem
            isChecked={currentState[item]}
            isSelected={item === selectedOverviewStep}
            value={item}
            key={item}
            currentState={currentState}
          />
        )
      })}
    </div>
  )
}

export default OverviewList
