import When from 'components/when/When'
import {useState} from 'react'
import getColorPalette from 'utils/getColorPalette'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import PlayOutlinedIcon from 'assets/icons/PlayOutlinedIcon'
import ConfirmStartTreatmentModal from './ConfirmStartTreatmentModal'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import AddReminderForTreatment from './AddReminderForTreatment'
import CalenderIcon from 'assets/icons/CalenderIcon'
import moment from 'moment'
import useAllUserPlan from '@hooks/useAllUserPlan'
import hasValue from 'utils/hasValue'

const StartingSoonStep = () => {
  const {isPractice, isGrowthPlanUser} = useAllUserPlan()
  const [openModal, setOpenModal] = useState(false)
  const [openReminderModal, setOpenReminderModal] = useState(false)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const gettingStartedStepData = data?.getting_started_details
  const isActivePlanPresent =
    hasValue(gettingStartedStepData?.treatment_plan_id) &&
    gettingStartedStepData?.treatment_status === 'ACTIVE'

  return (
    <div className='w-full flex flex-col gap-3'>
      <ConfirmStartTreatmentModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        planId={gettingStartedStepData?.treatment_plan_id}
      />
      <AddReminderForTreatment openModal={openReminderModal} setOpenModal={setOpenReminderModal} />
      <When isTrue={isPractice || isGrowthPlanUser}>
        <div className='text-xl font-semibold '>Starting soon</div>
      </When>
      <div className='flex flex-col gap-3'>
        <When isTrue={isActivePlanPresent}>
          <div className='flex md:flex-row flex-col md:items-center items-start justify-between gap-2 border border-mediumGray bg-white p-4 rounded-lg'>
            <div className='flex md:items-center items-start gap-3'>
              <div className='bg-primarySupport p-4 rounded-lg w-fit'>
                <PlayOutlinedIcon />
              </div>
              <div className='text-base text-textColor'>
                <p className=' text-black font-semibold'>
                  <div> Start treatment</div>
                </p>
                <p className='text-textColor font-normal text-sm'>
                  Set a reminder or start the treatment manually at any time.
                </p>
              </div>
            </div>
            <div>
              <div className='flex flex-col md:flex-row items-center gap-3'>
                {gettingStartedStepData?.reminder_date ? (
                  <div className='flex gap-1 items-center'>
                    <CalenderIcon color='#666666' />
                    <div className='text-sm font-medium'>
                      {moment(gettingStartedStepData?.reminder_date).format('DD-MMM-YYYY')}
                    </div>
                    <button
                      className='text-sm font-semibold text-primaryColor'
                      onClick={() => {
                        setOpenReminderModal(true)
                      }}
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <button
                    className={
                      'bg-primarySupport border border-primaryColor text-primaryColor py-2 px-4 flex items-center gap-2 rounded-lg font-semibold'
                    }
                    onClick={() => {
                      setOpenReminderModal(true)
                    }}
                  >
                    Set reminder
                  </button>
                )}
                <button
                  className={
                    'bg-primaryColor text-white py-2 px-4 flex items-center gap-2 rounded-lg font-semibold'
                  }
                  onClick={() => {
                    setOpenModal(true)
                  }}
                >
                  <div>Start treatment</div>
                  <CaretRightIcon color={getColorPalette().primaryColor} />
                </button>
              </div>
            </div>
          </div>
        </When>
      </div>
    </div>
  )
}

export default StartingSoonStep
